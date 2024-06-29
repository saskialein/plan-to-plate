/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $UserCreate = {
    properties: {
        email: {
            type: 'string',
            isRequired: true,
        },
        isActive: {
            type: 'boolean',
        },
        isSuperuser: {
            type: 'boolean',
        },
        fullName: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        password: {
            type: 'string',
            isRequired: true,
        },
    },
} as const;
