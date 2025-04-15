import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        name: 'local',
        include: ['test/local/**/*.test.ts'],
        environment: 'node',
    },
})
