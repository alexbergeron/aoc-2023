import Person, { sayHello } from "./lib.ts";

const ada: Person = {
	firstName: "Ada",
	lastName: "Lovelace",
};

console.log(sayHello(ada));
