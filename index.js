/*document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('fa-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const states = document.getElementById('states').value.split(',').map(s => s.trim());
        const alphabet = document.getElementById('alphabet').value.split(',').map(s => s.trim());
        const transitions = document.getElementById('transitions').value.split(';').map(s => s.trim());
        const startState = document.getElementById('start-state').value.trim();
        const finalStates = document.getElementById('final-states').value.split(',').map(s => s.trim());

        if (validateInput(states, alphabet, transitions, startState, finalStates)) {
            const fa = createFA(states, alphabet, transitions, startState, finalStates);
            displayFA(fa);
            drawFADiagram(fa);
        } else {
            alert("Invalid input. Please check your entries and try again.");
        }
    });

    function validateInput(states, alphabet, transitions, startState, finalStates) {
        // Basic validation for empty values
        if (states.length === 0 || alphabet.length === 0 || transitions.length === 0 || !startState || finalStates.length === 0) {
            return false;
        }

        // Check if the start state is a valid state
        if (!states.includes(startState)) {
            return false;
        }

        // Check if all final states are valid states
        for (const finalState of finalStates) {
            if (!states.includes(finalState)) {
                return false;
            }
        }

        // Check if transitions are valid
        for (const transition of transitions) {
            const parts = transition.split(',');
            if (parts.length !== 3) {
                return false;
            }
            const [state, symbol, nextState] = parts.map(s => s.trim());
            if (!states.includes(state) || !alphabet.includes(symbol) || !states.includes(nextState)) {
                return false;
            }
        }

        return true;
    }

    function createFA(states, alphabet, transitions, startState, finalStates) {
        const fa = {
            states: new Set(states),
            alphabet: new Set(alphabet),
            transitions: {},
            startState: startState,
            finalStates: new Set(finalStates)
        };

        transitions.forEach(transition => {
            const [state, symbol, nextState] = transition.split(',').map(s => s.trim());
            if (!fa.transitions[state]) {
                fa.transitions[state] = {};
            }
            fa.transitions[state][symbol] = nextState;
        });

        return fa;
    }

    function displayFA(fa) {
        const faDisplay = document.querySelector('.fa-display');
        faDisplay.innerHTML = ''; // Clear previous content

        const faDetails = `
            <h2>Finite Automaton Details</h2>
            <p><strong>States:</strong> ${Array.from(fa.states).join(', ')}</p>
            <p><strong>Alphabet:</strong> ${Array.from(fa.alphabet).join(', ')}</p>
            <p><strong>Start State:</strong> ${fa.startState}</p>
            <p><strong>Final States:</strong> ${Array.from(fa.finalStates).join(', ')}</p>
            <h3>Transitions:</h3>
            <ul>
                ${Object.keys(fa.transitions).map(state => 
                    Object.keys(fa.transitions[state]).map(symbol => 
                        `<li>${state} -- ${symbol} --> ${fa.transitions[state][symbol]}</li>`
                    ).join('')
                ).join('')}
            </ul>
        `;

        faDisplay.innerHTML = faDetails;
    }

    function drawFADiagram(fa) {
        const elements = [];

        // Add nodes for each state
        fa.states.forEach(state => {
            elements.push({
                data: { id: state, label: state },
                classes: (state === fa.startState ? 'start-state' : '') + (fa.finalStates.has(state) ? ' final-state' : '')
            });
        });

        // Add edges for each transition
        Object.keys(fa.transitions).forEach(state => {
            Object.keys(fa.transitions[state]).forEach(symbol => {
                elements.push({
                    data: {
                        source: state,
                        target: fa.transitions[state][symbol],
                        label: symbol
                    }
                });
            });
        });

        // Initialize cytoscape
        cytoscape({
            container: document.getElementById('cy'),
            elements: elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'label': 'data(label)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'background-color': '#666',
                        'color': '#fff',
                        'shape': 'ellipse'
                        

                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'label': 'data(label)',
                        'text-rotation': 'autorotate',
                        'curve-style': 'bezier',
                        'target-arrow-shape': 'triangle',
                        'width': 2,
                        'line-color': '#ccc',
                        'target-arrow-color': '#ccc'
                    }
                },
                {
                    selector: '.start-state',
                    style: {
                        'background-color': '#1a73e8'
                    }
                },
                {
                    selector: '.final-state',
                    style: {
                        'background-color': '#34a853',
                        'shape': 'double-octagon'
                    }
                }
            ],
            layout: {
                name: 'grid',
                rows: 1
            }
        });
    }
});
*/

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
            {
                selector: 'node',
                style: {
                    'label': 'data(label)',
                    'text-valign': 'center',
                    'color': '#000',
                    'background-color': '#ccc',
                    'width': '60px',
                    'height': '60px',
                    'font-size': '12px',
                }
            },
            {
                selector: 'edge',
                style: {
                    'label': 'data(label)',
                    'width': 2,
                    'line-color': '#000',
                    'target-arrow-color': '#000',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                }
            }
        ],
        layout: {
            name: 'grid',
            rows: 1
        }
    });

    faForm.addEventListener("submit", (event) => {
        event.preventDefault();
        automaton.states = document.getElementById("states").value.split(',');
        automaton.alphabet = document.getElementById("alphabet").value.split(',');
        automaton.transitions = document.getElementById("transitions").value.split(',').map(t => {
            const [from, symbol, to] = t.split(' ');
            return { from, symbol, to };
        });
        automaton.startState = document.getElementById("start-state").value;
        automaton.finalStates = document.getElementById("final-states").value.split(',');

        renderAutomaton(automaton);
        faDisplay.innerText = `FA created with states: ${automaton.states.join(', ')}`;
    });

    document.getElementById("test-deterministic").addEventListener("click", () => {
        const isDeterministic = checkIfDeterministic(automaton);
        faDisplay.innerText = isDeterministic ? "The FA is deterministic." : "The FA is not deterministic.";
    });

    document.getElementById("test-string").addEventListener("click", () => {
        const inputString = document.getElementById("test-string-input").value;
        const isAccepted = testStringAcceptance(automaton, inputString);
        faDisplay.innerText = isAccepted ? `The string "${inputString}" is accepted by the FA.` : `The string "${inputString}" is not accepted by the FA.`;
    });

    document.getElementById("convert-to-dfa").addEventListener("click", () => {
        automaton = convertNfaToDfa(automaton);
        renderAutomaton(automaton);
        faDisplay.innerText = `Converted NFA to DFA. States: ${automaton.states.join(', ')}`;
    });

    document.getElementById("minimize-dfa").addEventListener("click", () => {
        automaton = minimizeDfa(automaton);
        renderAutomaton(automaton);
        faDisplay.innerText = `Minimized DFA. States: ${automaton.states.join(', ')}`;
    });

    function checkIfDeterministic(fa) {
        const transitionMap = {};
        for (let { from, symbol } of fa.transitions) {
            if (!transitionMap[from]) {
                transitionMap[from] = {};
            }
            if (transitionMap[from][symbol]) {
                return false;
            }
            transitionMap[from][symbol] = true;
        }
        return true;
    }

    function testStringAcceptance(fa, inputString) {
        let currentState = fa.startState;
        for (let char of inputString) {
            const transition = fa.transitions.find(t => t.from === currentState && t.symbol === char);
            if (!transition) {
                return false;
            }
            currentState = transition.to;
        }
        return fa.finalStates.includes(currentState);
    }

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
    function minimizeDfa(dfa) {
        const { states, alphabet, transitions, startState, finalStates } = dfa;
    
        // Step 1: Initialize partitioning P with final and non-final states
        let P = [new Set(finalStates), new Set(states.filter(s => !finalStates.includes(s)))];
        let W = [new Set(finalStates)]; // Work list initialized with final states
    
        // Function to get all transitions from a state with a given symbol
        function getTransitions(state, symbol) {
            return transitions
                .filter(t => t.from === state && t.symbol === symbol)
                .map(t => t.to);
        }
    
        // Function to split a set C into two sets based on the transitions to X
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
    
        // Step 2: Iterate until no more splits are possible
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
    
        // Step 3: Construct the minimized DFA
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
    



    function renderAutomaton(fa) {
        cy.elements().remove();
        const elements = convertAutomatonToCytoscapeElements(fa);
        cy.add(elements);
        cy.layout({ name: 'grid' }).run();
    }

    function convertAutomatonToCytoscapeElements(fa) {
        const elements = [];
        fa.states.forEach(state => {
            elements.push({
                group: 'nodes',
                data: { id: state, label: state }
            });
        });
        fa.transitions.forEach(({ from, to, symbol }) => {
            elements.push({
                group: 'edges',
                data: { id: `${from}-${to}`, source: from, target: to, label: symbol }
            });
        });
        return elements;
    }

    function setToString(set) {
        return [...set].sort().join(',');
    }
});
