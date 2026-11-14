import { get_encoding } from "tiktoken";

const encoderForGpt2 = get_encoding("gpt2");

const encoedTokens = encoderForGpt2.encode("hello, I'am Manasa!");

const decoedTokens = encoderForGpt2.decode(encoedTokens)

console.log(encoedTokens);
console.log(new TextDecoder().decode(decoedTokens));