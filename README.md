Project Title
AIE Scientific Discovery Lab
One-Line Description
An agentic scientific discovery system that generates falsifiable hypotheses, runs deterministic computational experiments, learns from evidence, and selects the next experiment.
Project Description / Story
Scientific AI today is very good at generating hypotheses, but generation is not discovery.

AIE Scientific Discovery Lab creates a closed-loop research system where AI agents propose competing, falsifiable hypotheses, design experiments, analyze computational observations, update hypothesis confidence, and determine what should be tested next.

The system begins with a scientific research question and theoretical baseline. Gemini performs research synthesis and generates competing causal hypotheses with predicted parameter ranges and falsification criteria.

An experiment planner proposes parameter sweeps. A deterministic utility function then selects the experiment based on information gain, hypothesis discrimination, feasibility, cost, and risk.

The selected experiment is executed by a deterministic numerical engine rather than by the language model. For the superconductivity benchmark, AIE evaluates the Allen-Dynes Modified McMillan formalism across parameter sweeps of doping concentration and critical temperature.

The resulting observations are independently analyzed. Parameter residuals and metric residuals are kept dimensionally separate. Hypotheses receive evidence-based confidence updates, epistemic uncertainty is calculated, and an entropy-driven selector determines the next experiment.

Across three computational iterations, the search corridor narrowed from [0.16, 0.26] to [0.2025, 0.2275], while the leading hypothesis increased from 50% to 83% confidence and reported epistemic uncertainty decreased from 74.0% to 29.1%.

AIE explicitly classifies these results as MODEL-DEPENDENT computational evidence rather than experimental scientific validation.

The core principle is:

Agents propose. Deterministic computation tests. Evidence updates. The system chooses what happens next.
Technical Methodology
AIE uses a seven-stage agentic scientific discovery workflow:

1. Research Agent — synthesizes the research context and theoretical baseline using Gemini.
2. Hypothesis Agent — generates competing falsifiable causal hypotheses with predicted optima, acceptable parameter windows, and falsification criteria.
3. Experiment Planner — generates candidate parameter-sweep experiments.
4. Deterministic Experiment Selector — ranks candidate experiments using information gain, hypothesis discrimination, feasibility, cost, and risk.
5. Numerical Experiment Engine — executes deterministic computational parameter sweeps using the selected scientific benchmark.
6. Result Analyzer — compares observations against competing hypotheses and performs Bayesian confidence updates.
7. Next Experiment Selector — evaluates remaining epistemic uncertainty and generates the next experiment corridor.

The language model proposes research content and hypotheses. The deterministic computational engine produces the experimental observations. This separation prevents the language model from fabricating experimental results.

The system maintains hypothesis identity across iterations and carries posterior confidence from one iteration forward as the prior for the next iteration.

Parameter residuals and metric residuals are evaluated independently to prevent dimensional conflation and incorrect hypothesis classification.
Research Benchmark / Dataset Disclosure
Benchmark: Allen-Dynes Modified McMillan computational superconductivity model.

AIE does not use a laboratory dataset for this demonstration. Observations are generated through deterministic computational parameter sweeps.

The demonstrated result is therefore MODEL-DEPENDENT computational evidence and not experimental scientific validation.
Built With
Google Gemini
Google GenAI SDK (@google/genai)
React
TypeScript
Vite
Node.js
Express
Tailwind CSS
Custom Deterministic Numerical Experiment Engine
Allen-Dynes Modified McMillan Computational Benchmark
Key Innovation
AIE separates hypothesis generation from experimental execution.

AI agents generate research context and competing falsifiable hypotheses. Deterministic computational infrastructure performs the experiment. The resulting evidence updates hypothesis confidence and determines what experiment should happen next.

This creates a closed-loop scientific discovery process rather than a one-shot AI answer.
Results
Iteration 1
Search corridor: [0.16, 0.26]
Resolution: 0.005
Observed optimum: x = 0.2150
Peak Tc: 64.13 K
Leading hypothesis confidence: 50% → 62%
Epistemic uncertainty: 74.0%

Iteration 2
Search corridor: [0.19, 0.24]
Resolution: 0.0025
Observed optimum: x = 0.2150
Peak Tc: 64.37 K
Leading hypothesis confidence: 62% → 75%
Epistemic uncertainty: 49.2%

Iteration 3
Search corridor: [0.2025, 0.2275]
Resolution: 0.0013
Observed optimum: x = 0.2142
Peak Tc: 64.48 K
Leading hypothesis confidence: 75% → 83%
Epistemic uncertainty: 29.1%
Scientific Integrity
AIE distinguishes computational evidence from experimentally validated scientific knowledge.

The demonstrated superconductivity result is derived from a deterministic Allen-Dynes Modified McMillan computational benchmark. It is classified as MODEL-DEPENDENT and should not be interpreted as laboratory confirmation.

The system records experiment parameters, deterministic signatures, observations, hypothesis states, confidence updates, and provenance to support reproducibility and auditability.
Short Pitch
AIE Scientific Discovery Lab transforms AI from a hypothesis generator into a closed-loop scientific discovery system.

Agents generate competing hypotheses. Deterministic computation tests them. Evidence updates confidence. The system selects the next experiment.

Across three iterations, the system progressively narrowed the computational search toward x = 0.2142 while reducing epistemic uncertainty from 74.0% to 29.1%.

Agents propose. Deterministic computation tests. Evidence updates. The system decides what happens next.

