// This function rounds a given number such that only 2 decimal places remain
export default function roundNumber(givenNumber: number, decimalPlaces = 2) {
    const pow = 10 ** decimalPlaces;
    return Math.round(givenNumber * pow) / pow;
}
