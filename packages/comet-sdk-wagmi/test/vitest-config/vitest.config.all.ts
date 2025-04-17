import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        name: 'all',
        include: [
            'test/unit/**/*.test.ts',
            'test/e2e/**/*.e2e-test.ts'
        ],
        environment: 'node',
    },
})