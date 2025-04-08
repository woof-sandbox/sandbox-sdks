import { describe, expect, it } from "vitest";
import { coefficientToPercents } from "../../src";

describe("coefficientToPercents", () => {
    it("должна корректно конвертировать числовые коэффициенты в проценты", () => {
        expect(coefficientToPercents(0.5)).toBe("50.00000");
        expect(coefficientToPercents(1)).toBe("100.00000");
        expect(coefficientToPercents(0)).toBe("0.00000");
    });

    it("должна корректно конвертировать строковые коэффициенты в проценты", () => {
        expect(coefficientToPercents("0.5")).toBe("50.00000");
        expect(coefficientToPercents("1.23")).toBe("123.00000");
    });

    it("должна учитывать переданную точность округления", () => {
        expect(coefficientToPercents(0.12345, 3)).toBe("12.345");
        expect(coefficientToPercents(0.12345, 0)).toBe("12");
    });

    it("должна корректно обрабатывать отрицательные значения", () => {
        expect(coefficientToPercents(-0.5)).toBe("-50.00000");
        expect(coefficientToPercents("-1.2", 1)).toBe("-120.0");
    });
});