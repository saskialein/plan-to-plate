/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MealPlanRequest = {
    properties: {
        diets: {
            type: 'array',
            contains: {
                type: 'string',
            },
            isRequired: true,
        },
        vegetables: {
            type: 'array',
            contains: {
                type: 'string',
            },
            isRequired: true,
        },
        numberOfPeople: {
            type: 'number',
            isRequired: true,
        },
        startDay: {
            type: 'string',
            isRequired: true,
        },
    },
} as const;
