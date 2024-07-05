/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MealPlanCreate = {
    properties: {
        plan: {
            type: 'WeekMealPlan_Input',
            isRequired: true,
        },
        startDate: {
            type: 'string',
            isRequired: true,
            format: 'date',
        },
    },
} as const;
