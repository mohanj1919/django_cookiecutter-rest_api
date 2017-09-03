# Overview

There are 12 types of records that the user of the REST API may create, which will be described below.

OM1 will define the API, provide a swagger (http://swagger.io/) template, and if helpful, generate the swagger server-side stub and client-side client.

The server-side stub can provide the outline for the code that needs to be implemented.

The client-side client can be used if helpful to aid in manual and automated testing.

## Object hierarchy

At the highest level, we have the idea of a patient cohort, which is simply a grouping of patients.

* domain/cohort

Each cohort will have patients associated with it. A patient may belong to one or more cohorts.
* domain
  * patient

Patients should have one or more encounters:
* domain
  * patient
    * encounter

Encounters may have one or more records associated with them, belonging to eleven different records.
Each record will have an ENCOUNTER_ID which can be used to join to the encounter in question

* domain
  * patient
      * encounter
        * diagnosis
        * insurance
        * joint_exam
        * medication_record
        * note
        * observation
        * procedure
        * questionnaire
        * result

With this hierarchy, some data will not be sent multiple times. For example, PATIENT_ID is provided by the patient
record. Timestamps are provided by the encounter for all records that are children of that encounter.


# General API Design

## Lifecycle

A typical lifecycle of the OM1 interaction with the curation API would be as follows:

1. A domain/cohort is created
2. Multiple sequential calls are made to create patient records, including all clinical data.

## Response codes

* Successful requests should yield a 200.
* Bad data [including unknown fields] should yield a 400.
* Application errors should yield a 500.

# Object/Record fields

For each valid POST request, a record would need to be created in the curation app.

A list of fields for each kind of record is provided below. These would be included in the POST body of the request in JSON format. Fields may be null or empty for a given record.

Other than `id` fields, values for the other fields in these records should be displayable to the user.
No mapping to code or lookup tables will be neccesary.

The definition of these objects is subject to change, albeit infrequently. If one or more unknown fields are included in the POST request for an object, the API should return an error listing the unknown fields.


OM1 Note:

DIAGNOSIS_CODE (ICD/SNOMED code) -> look it up in the rollup table, - condition name
