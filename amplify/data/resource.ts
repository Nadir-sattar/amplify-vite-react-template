import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  MotionTelemetry: a.customType({
    deviceName: a.string().required(),
    timestamp: a.string().required(),
    motion: a.boolean().required(),
  }),

  getTelemetry: a
    .query()
    .arguments({
      deviceName: a.string().required(),
    })
    .returns(a.ref("MotionTelemetry").array())
    .authorization((allow) => [allow.authenticated()])
    .handler(
      a.handler.custom({
        dataSource: "MotionTelemetryDataSource",
        entry: "./getTelemetry.js",
      })
    ),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});