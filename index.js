

//========================================Project Automata==========================================

document.addEventListener("DOMContentLoaded", () => {
    const faForm = document.getElementById("fa-form");
    const faDisplay = document.querySelector(".fa-display");
    const cyContainer = document.getElementById("cy");

    let automaton = {
        states: [],
        alphabet: [],
        transitions: [],
        startState: null,
        finalStates: []
    };

    // Initialize Cytoscape
    const cy = cytoscape({
        container: cyContainer,
        elements: [],
        style: [
            { selector: 'node', style: { 'label': 'data(label)', 'text-valign': 'center', 'color': '#000', 'background-color': '#ccc', 'width': '60px', 'height': '60px', 'font-size': '12px' } },
            { selector: 'edge', style: { 'label': 'data(label)', 'width': 2, 'line-color': '#000', 'target-arrow-color': '#000', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier' } }
        ],
        layout: { name: 'grid', rows: 1 }
    });

    // Event listener for FA creation
    faForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const statesInput = document.getElementById("states");
        const alphabetInput = document.getElementById("alphabet");
        const transitionsInput = document.getElementById("transitions");
        const startStateInput = document.getElementById("start-state");
        const finalStatesInput = document.getElementById("final-states");

        automaton.states = statesInput.value.split(',');
        automaton.alphabet = alphabetInput.value.split(',');
        automaton.transitions = parseTransitions(transitionsInput.value);
        automaton.startState = startStateInput.value;
        automaton.finalStates = finalStatesInput.value.split(',');

        renderAutomaton(automaton); // Render the automaton diagram
        faDisplay.innerText = `FA created with states: ${automaton.states.join(', ')}`;
    });

    // Event listener for converting NFA to DFA
    document.getElementById("convert-to-dfa").addEventListener("click", () => {
        automaton = convertNfaToDfa(automaton);
        renderAutomaton(automaton);
        faDisplay.innerText = `Converted NFA to DFA. States: ${automaton.states.join(', ')}`;
    });

    // Event listener for minimizing DFA
    document.getElementById("minimize-dfa").addEventListener("click", () => {
        automaton = minimizeDfa(automaton);
        renderAutomaton(automaton);
        faDisplay.innerText = `Minimized DFA. States: ${automaton.states.join(', ')}`;
    });

    // Event listener for testing a string against the FA
    document.getElementById("test-string").addEventListener("click", () => {
        const inputString = document.getElementById("test-string-input").value.trim();
        const result = testString(inputString, automaton);
        if (result) {
            faDisplay.innerText = `String "${inputString}" is accepted.`;
        } else {
            faDisplay.innerText = `String "${inputString}" is rejected.`;
        }
    });

    // Function to parse transitions input
    function parseTransitions(transitionsInput) {
        return transitionsInput.split(',').map(t => {
            const [from, symbol, to] = t.trim().split(' ');
            return { from, symbol, to };
        });
    }

    // Function to render the automaton diagram using Cytoscape
    function renderAutomaton(fa) {
        cy.elements().remove(); // Remove existing elements from Cytoscape
        const elements = convertAutomatonToCytoscapeElements(fa); // Convert FA to Cytoscape elements
        cy.add(elements); // Add new elements to Cytoscape
        cy.layout({ name: 'grid' }).run(); // Run layout to arrange elements
    }

    // Function to convert NFA to DFA
    function convertNfaToDfa(nfa) {
        let dfa = {
            states: [],
            alphabet: nfa.alphabet,
            transitions: [],
            startState: nfa.startState,
            finalStates: []
        };
        let newStates = [new Set([nfa.startState])];
        let unprocessedStates = [new Set([nfa.startState])];
        let stateMap = { [setToString(new Set([nfa.startState]))]: nfa.startState };

        while (unprocessedStates.length > 0) {
            let currentState = unprocessedStates.pop();
            let currentStateStr = setToString(currentState);

            nfa.alphabet.forEach(symbol => {
                let newState = new Set();
                currentState.forEach(state => {
                    nfa.transitions
                        .filter(t => t.from === state && t.symbol === symbol)
                        .forEach(t => newState.add(t.to));
                });

                if (newState.size > 0) {
                    let newStateStr = setToString(newState);
                    if (!stateMap[newStateStr]) {
                        stateMap[newStateStr] = newStateStr;
                        newStates.push(newState);
                        unprocessedStates.push(newState);
                    }
                    dfa.transitions.push({ from: currentStateStr, symbol, to: newStateStr });
                }
            });

            if (Array.from(currentState).some(state => nfa.finalStates.includes(state))) {
                dfa.finalStates.push(currentStateStr);
            }
        }

        dfa.states = Object.keys(stateMap);
        return dfa;
    }

    // Function to minimize DFA
    function minimizeDfa(dfa) {
        const { states, alphabet, transitions, startState, finalStates } = dfa;

        let P = [new Set(finalStates), new Set(states.filter(s => !finalStates.includes(s)))];
        let W = [new Set(finalStates)];

        function getTransitions(state, symbol) {
            return transitions
                .filter(t => t.from === state && t.symbol === symbol)
                .map(t => t.to);
        }

        function split(C, a, X) {
            const { C1, C2 } = Array.from(C).reduce(
                ({ C1, C2 }, state) => {
                    const isInX = X.has(getTransitions(state, a)[0]);
                    if (isInX) {
                        C1.add(state);
                    } else {
                        C2.add(state);
                    }
                    return { C1, C2 };
                },
                { C1: new Set(), C2: new Set() }
            );

            return [C1, C2].filter(s => s.size > 0);
        }

        while (W.length > 0) {
            const A = W.pop();
            for (const a of alphabet) {
                const X = new Set(
                    states.filter(s => {
                        const toStates = getTransitions(s, a);
                        return toStates.length > 0 && A.has(toStates[0]);
                    })
                );

                const newP = [];
                for (const C of P) {
                    const [C1, C2] = split(C, a, X);
                    if (C2 && C2.size > 0) {
                        newP.push(C1);
                        newP.push(C2);

                        if (W.includes(C)) {
                            W.push(C1);
                            W.push(C2);
                        } else {
                            W.push(C1.size <= C2.size ? C1 : C2);
                        }
                    } else {
                        newP.push(C);
                    }
                }

                P = newP;
            }
        }

        const newStates = P.map(group => Array.from(group).sort().join(','));
        const newTransitions = [];
        for (const { from, symbol, to } of transitions) {
            const fromState = P.find(group => group.has(from));
            const toState = P.find(group => group.has(to));

            const newFromState = newStates[P.indexOf(fromState)];
            const newToState = newStates[P.indexOf(toState)];

            if (
                !newTransitions.some(
                    t => t.from === newFromState && t.symbol === symbol && t.to === newToState
                )
            ) {
                newTransitions.push({ from: newFromState, symbol, to: newToState });
            }
        }

        const newStartState = newStates[P.findIndex(group => group.has(startState))];
        const newFinalStates = P.filter(group =>
            Array.from(group).some(s => finalStates.includes(s))
        ).map(group => Array.from(group).sort().join(','));

        return {
            states: newStates,
            alphabet,
            transitions: newTransitions,
            startState: newStartState,
            finalStates: newFinalStates
        };
    }

    // Function to convert automaton to Cytoscape elements
    function convertAutomatonToCytoscapeElements(fa) {
        const elements = [];
        fa.states.forEach(state => {
            elements.push({ group: 'nodes', data: { id: state, label: state } });
        });
        fa.transitions.forEach(({ from, to, symbol }) => {
            elements.push({ group: 'edges', data: { id: `${from}-${to}`, source: from, target: to, label: symbol } });
        });
        return elements;
    }

    // Utility function to convert set to string
    function setToString(set) {
        return [...set].sort().join(',');
    }

    // Function to test a string against the FA
    function testString(inputString, fa) {
        let currentState = fa.startState;
        for (let symbol of inputString) {
            const transition = fa.transitions.find(t => t.from === currentState && t.symbol === symbol);
            if (!transition) {
                return false; // No valid transition for the current symbol
            }
            currentState = transition.to;
        }
        return fa.finalStates.includes(currentState); // Check if the final state is reached
    }

    // Event listener for checking if FA is deterministic
    document.getElementById("test-deterministic").addEventListener("click", () => {
        const isDeterministic = checkDeterministic(automaton);
        if (isDeterministic) {
            faDisplay.innerText = "The FA is deterministic.";
        } else {
            faDisplay.innerText = "The FA is not deterministic.";
        }
    });

    // Function to check if the FA is deterministic
    function checkDeterministic(fa) {
        for (const state of fa.states) {
            const transitionsFromState = fa.transitions.filter(t => t.from === state);
            const symbols = transitionsFromState.map(t => t.symbol);
            if (new Set(symbols).size !== symbols.length) {
                return false; // Duplicate symbols in transitions from the same state
            }
        }
        return true;
    }
});

