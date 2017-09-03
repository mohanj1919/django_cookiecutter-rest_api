# Questions

Questions should support the following data:

* text

The actual text of the question that will be asked

* responses

The possible responses for the question. For now, let's make it a string of comma-separated values

* type

{single/multiple/numeric}

* parent_question

The ID of a parent question.

A parent question is a question whose response will determine whether or not this question gets displayed / needs a response. Parent / Child questions will be explained below.

* parent_condition
The response on the parent question that would enable this question.

* note

Optional text that may provide instruction, guidance, or explanation for the question.
This explanatory note shoudl be displayed alongside the question in the UI.


## Parent Questions / Child Questions:

### Example

1) Does this patient have diabetes.

Yes / No / Unknown

Child Question:
2) What kind of diabetes does this patient have?

Type 1 / Type 2 / Unknown

If (1) is the parent question to (2), and the parent condition is "Yes"

Then only if the answer to (1) is Yes, should question (2) be displayed / asked.

Re: database design for the parent question - it may be beneficial when coding the conditional logic
for the parent / child relationship to be stored on the parent, so that the child questions could be
loaded or displayed dynamically based on the parent question state change.

# CRFs

CRFs join together a sequence of questions.

Whether or not there are sections and related metadata on sections as part of the CRF is TBD.

For now, a CRF would be a collection of questions that need to be answered for the CRF to be complete.