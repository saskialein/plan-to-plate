/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ChatResponse = {
    properties: {
        response: {
            type: 'string',
            isRequired: true,
        },
        history: {
            type: 'ChatHistoryModel',
            isRequired: true,
        },
    },
} as const;
