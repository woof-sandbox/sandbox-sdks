import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        name: 'local',
        include: ['packages/**/test/local/**/*.test.ts'],
        environment: 'node',
    },
})
