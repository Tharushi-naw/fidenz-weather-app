const test = require("node:test");
const assert = require("node:assert");

const {
    clampScore,
    calculateComfortIndex
} = require("../utils/comfort");


test("clampScore keeps a normal score unchanged", () => {
    assert.strictEqual(
        clampScore(75),
        75
    );
});


test("clampScore prevents scores below zero", () => {
    assert.strictEqual(
        clampScore(-20),
        0
    );
});


test("clampScore prevents scores above one hundred", () => {
    assert.strictEqual(
        clampScore(120),
        100
    );
});


test("ideal weather produces a comfort score of 100", () => {
    const score = calculateComfortIndex(
        22,
        50,
        2
    );

    assert.strictEqual(
        score,
        100
    );
});


test("comfort score always stays between zero and one hundred", () => {
    const score = calculateComfortIndex(
        50,
        100,
        20
    );

    assert.ok(score >= 0);
    assert.ok(score <= 100);
});


test("less comfortable conditions produce a lower score", () => {
    const comfortableScore =
        calculateComfortIndex(
            22,
            50,
            2
        );

    const uncomfortableScore =
        calculateComfortIndex(
            35,
            90,
            10
        );

    assert.ok(
        comfortableScore >
        uncomfortableScore
    );
});

test("better visibility produces a higher comfort score" , () => { const good = calculateComfortIndex(22,50,2,10000); const poor = calculateComfortIndex(22,50,2,2000); assert.ok(good>poor);});