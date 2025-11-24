import { LexicalAnalyzer } from "./core";

const lexer = new LexicalAnalyzer(`open fold Sample
sharp crease counter = 0;
bend rate = 1.5;
mark letter = 'A';
corner flag = true;
flat craft();

mountain(counter < 5) {
    pleat(crease i = 0; i < 3; i++) {
        spiral(flag) {
            flip;
        }
    }
    valley {
        tear;
    }
}

`);

console.log(lexer.tokenize());
