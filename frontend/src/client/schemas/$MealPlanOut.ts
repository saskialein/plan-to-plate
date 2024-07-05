/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MealPlanOut = {
    properties: {
        plan: {
            type: 'app__models__WeekMealPlan_Output',
            isRequired: true,
        },
        startDate: {
            type: 'string',
            isRequired: true,
            format: 'date',
        },
        id: {
            type: 'number',
            isRequired: true,
        },
        ownerId: {
            type: 'number',
            isRequired: true,
        },
    },
} as const;
