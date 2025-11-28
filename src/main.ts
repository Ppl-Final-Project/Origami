import { LexicalAnalyzer } from "./core";

// Sample code to test
const sampleCode = `
open fold Sample
edge length = 10;
thick width = 2.5;
thin height = 0.5;
mark label = 'X';
crease angle = 45;
flat surface = aligned;

figure(length > 5) {
    center;
    work(crease i = 0; i < 3; i++) {
        layer(angle < 90) {
            spiral(label) {
                flip;
                reveal;
            }
        }
    }
    front {
        tear;
    }
    back {
        smooth;
    }
}

sealed craft createOrigami() {
    draft {
        // This is a comment
        crumple;
    }
}`;

const lexer = new LexicalAnalyzer(sampleCode);
const tokens = lexer.tokenize();

console.log('Lexer Output with New Enforcement:');
console.log('==================================');

console.log('┌──────────────────────┬─────────────────────┬──────┬────────┐');
console.log('│ Lexeme               │ Token               │ Line │ Column │');
console.log('├──────────────────────┼─────────────────────┼──────┼────────┤');

tokens.forEach((token, index) => {
    const lexeme = token.value.length > 20 ? token.value.substring(0, 17) + '...' : token.value;
    const tokenType = token.type.length > 19 ? token.type.substring(0, 16) + '...' : token.type;
    
    console.log(`│ ${lexeme.padEnd(20)} │ ${tokenType.padEnd(19)} │ ${token.line.toString().padStart(4)} │ ${token.column.toString().padStart(6)} │`);
});

console.log('└──────────────────────┴─────────────────────┴──────┴────────┘');

console.log(`\nTotal Tokens: ${tokens.length}`);

console.log('\nProblematic Identifiers:');
console.log('========================');
const problemTokens = tokens.filter(t => 
    t.type === 'UNKNOWN_IDENTIFIER' || 
    t.type === 'UNKNOWN'
);
problemTokens.forEach((token) => {
    console.log(`[X] "${token.value}" at line ${token.line}, column ${token.column} - ${token.type}`);
});

if (problemTokens.length === 0) {
    console.log('[OK] No problematic identifiers found!');
}