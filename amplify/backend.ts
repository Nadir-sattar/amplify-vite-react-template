import { defineBackend } from "@aws-amplify/backend";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { auth } from "./auth/resource";
import { data } from "./data/resource";

const backend = defineBackend({
  auth,
  data,
});

const externalDataSourcesStack = backend.createStack(
  "ExternalDataSources"
);

const motionTable = Table.fromTableName(
  externalDataSourcesStack,
  "MotionTelemetryTable",
  "MotionTelemetry"
);

backend.data.addDynamoDbDataSource(
  "MotionTelemetryDataSource",
  motionTable
);