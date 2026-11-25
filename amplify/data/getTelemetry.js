import { util } from "@aws-appsync/utils";

export function request(ctx) {
    return {
        operation: "Query",
        query: {
            expression: "deviceName = :deviceName",
            expressionValues: {
                ":deviceName": util.dynamodb.toDynamoDB(
                    ctx.args.deviceName
                ),
            },
        },
        scanIndexForward: false,
        limit: 100,
    };
}

export function response(ctx) {
    if (ctx.error) {
        util.error(ctx.error.message, ctx.error.type);
    }

    return ctx.result.items;
}