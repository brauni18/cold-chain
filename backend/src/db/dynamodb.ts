import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

// ── Client ─────────────────────────────────────────────

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'eu-north-1',
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// ── Table names ────────────────────────────────────────

export const READINGS_TABLE  = process.env.DYNAMODB_READINGS_TABLE  ?? 'cold-chain-sensors';
export const ENTITIES_TABLE  = process.env.DYNAMODB_ENTITIES_TABLE  ?? 'cold-chain-entities';

// ── Generic helpers ────────────────────────────────────

/** Put an item into a table. */
export async function putItem(table: string, item: Record<string, unknown>) {
  return docClient.send(new PutCommand({ TableName: table, Item: item }));
}

/** Get a single item by its full key. */
export async function getItem(table: string, key: Record<string, unknown>) {
  const result = await docClient.send(new GetCommand({ TableName: table, Key: key }));
  return result.Item ?? null;
}

/** Delete a single item by its full key. */
export async function deleteItem(table: string, key: Record<string, unknown>) {
  return docClient.send(new DeleteCommand({ TableName: table, Key: key }));
}

/**
 * Query a table by partition key, with optional sort-key begins_with prefix.
 * Returns all matching items.
 */
export async function queryByPartition(
  table: string,
  pkName: string,
  pkValue: string,
  skName?: string,
  skPrefix?: string,
) {
  let expression = `${pkName} = :pk`;
  const values: Record<string, unknown> = { ':pk': pkValue };

  if (skName && skPrefix) {
    expression += ` AND begins_with(${skName}, :skp)`;
    values[':skp'] = skPrefix;
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: table,
      KeyConditionExpression: expression,
      ExpressionAttributeValues: values,
    }),
  );
  return result.Items ?? [];
}

/**
 * Query readings for a specific sensor within an optional time range.
 * Returns newest-first by default.
 */
export async function queryReadings(
  sensorId: string,
  opts: {
    from?: string;   // ISO timestamp
    to?: string;     // ISO timestamp
    limit?: number;
    ascending?: boolean;
  } = {},
) {
  let expression = 'sensorId = :sid';
  const values: Record<string, unknown> = { ':sid': sensorId };

  const usesTimestamp = !!(opts.from || opts.to);

  if (opts.from && opts.to) {
    expression += ' AND #ts BETWEEN :from AND :to';
    values[':from'] = opts.from;
    values[':to'] = opts.to;
  } else if (opts.from) {
    expression += ' AND #ts >= :from';
    values[':from'] = opts.from;
  } else if (opts.to) {
    expression += ' AND #ts <= :to';
    values[':to'] = opts.to;
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: READINGS_TABLE,
      KeyConditionExpression: expression,
      ExpressionAttributeValues: values,
      ...(usesTimestamp && { ExpressionAttributeNames: { '#ts': 'timestamp' } }),
      ScanIndexForward: opts.ascending ?? false,   // false = newest first
      Limit: opts.limit,
    }),
  );
  return result.Items ?? [];
}

/**
 * Scan the readings table to discover all distinct sensorIds.
 * Uses ProjectionExpression to minimize read cost.
 * NOTE: this is acceptable while sensor count is small (<100).
 * For scale, move to querying the entities table instead.
 */
export async function discoverSensorIds(): Promise<string[]> {
  const ids = new Set<string>();
  let lastKey: Record<string, unknown> | undefined;

  do {
    const result = await docClient.send(
      new ScanCommand({
        TableName: READINGS_TABLE,
        ProjectionExpression: 'sensorId',
        ExclusiveStartKey: lastKey,
      }),
    );
    for (const item of result.Items ?? []) {
      ids.add(item.sensorId as string);
    }
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return [...ids];
}

/**
 * Update an item with SET expressions.
 * `fields` is a map of attribute names → new values.
 */
export async function updateItem(
  table: string,
  key: Record<string, unknown>,
  fields: Record<string, unknown>,
) {
  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {};
  const setParts: string[] = [];

  for (const [attr, val] of Object.entries(fields)) {
    const placeholder = `#f_${attr}`;
    const valPlaceholder = `:v_${attr}`;
    names[placeholder] = attr;
    values[valPlaceholder] = val;
    setParts.push(`${placeholder} = ${valPlaceholder}`);
  }

  return docClient.send(
    new UpdateCommand({
      TableName: table,
      Key: key,
      UpdateExpression: `SET ${setParts.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: 'ALL_NEW',
    }),
  );
}