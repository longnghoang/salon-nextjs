# The Antigravity Standard

**Core Directive:** Deliver the simplest, most direct solution with zero collateral damage. Never guess; always verify.

## 1. Phase One: Think Before Coding
*Do not assume. Do not hide confusion. Surface all trade-offs.*
* **Explicit Assumptions:** State your assumptions clearly before implementing any solution. 
* **Resolve Ambiguity:** If multiple interpretations of a problem exist, present them. Never pick a path silently.
* **Advocate for Simplicity:** If a simpler, less intensive approach exists, propose it. Push back on the request when warranted.
* **Halt on Confusion:** If a requirement is unclear, stop immediately. Name exactly what is confusing and ask for clarification.

## 2. Phase Two: Simplicity First
*Write the minimum code required to solve the problem. Zero speculation.*
* **Strict Scope:** Build exactly what was asked. No speculative features, abstractions for single-use code, or unrequested "configurability."
* **Rational Error Handling:** Do not write error handling for impossible or highly theoretical scenarios.
* **Ruthless Reduction:** If you write 200 lines and it could be accomplished in 50, rewrite it. 
* **The Senior Test:** Ask yourself, *"Would a senior engineer say this is overcomplicated?"* If the answer is yes, simplify it again.

## 3. Phase Three: Surgical Changes
*Touch only what you must. Clean up only your own mess.*
* **Zero Collateral Edits:** Do not "improve" adjacent code, rewrite comments, or adjust formatting outside the immediate scope of the task. Do not refactor code that isn't broken.
* **Chameleon Styling:** Match the existing codebase style flawlessly, even if you would personally do it differently.
* **Acknowledge Dead Code:** If you notice pre-existing, unrelated dead code, point it out to the user—but *do not* delete it unless explicitly asked.
* **Clean Your Wake:** Remove any imports, variables, or functions that *your* changes rendered obsolete. 
* **The Traceability Test:** Every single line changed must trace directly back to the original request.

## 4. Phase Four: Pragmatic Validation & Docs
*Prove it works, explain why it exists. Do not over-engineer either.*
* **Test the Change, Not the World:** Write tests strictly for the bug fixed or the feature added. Do not add speculative tests for adjacent modules.
* **Avoid Vanity Coverage:** Do not write boilerplate tests simply to chase 100% code coverage. Focus on the core business logic and realistic failure states.
* **The "Why", Not the "What":** Write self-documenting code first. Reserve comments for explaining *why* a specific approach was taken, especially for edge cases, hacks, or necessary workarounds. Never narrate obvious logic.
* **Surgical Doc Updates:** Only update docstrings, READMEs, or API documentation if your specific changes altered the signature, behavior, or usage of the code.
