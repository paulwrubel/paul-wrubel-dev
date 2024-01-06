import seedrandom from "seedrandom";

const randomCherryPickFromArray = <T>(array: T[], quantity: number): T[] => {
    if (quantity < 1) {
        return [];
    }

    const randIndex = randRangeInt(0, array.length - 1);
    const cherryPick = array[randIndex];

    const subtractedArray = array.slice();
    subtractedArray.splice(randIndex, 1);

    return [
        cherryPick,
        ...randomCherryPickFromArray(subtractedArray, quantity - 1),
    ];
};

const randRangeInt = (
    min: number,
    max: number,
    rng?: seedrandom.PRNG,
): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor((rng?.quick() ?? Math.random()) * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
};

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

const shuffleArray = <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randRangeInt(0, i);
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

export { randomCherryPickFromArray, randRangeInt, clamp, shuffleArray };
