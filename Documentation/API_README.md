# Overview

There are 12 types of records that the user of the REST API may create, which will be described below.

OM1 will define the API, provide a swagger (http://swagger.io/) template, and if helpful, generate the swagger server-side stub and client-side client. 

The server-side stub can provide the outline for the code that needs to be implemented.

The client-side client can be used if helpful to aid in manual and automated testing.

## Object hierarchy

At the highest level, we have the idea of a patient cohort, which is simply a grouping of patients.

* cohort

Each cohort will have patients associated with it. A patient may belong to one or more cohorts.
* cohort
  * patient

Patients should have one or more encounters:
* cohort
  * patient
    * encounter

Encounters may have one or more records associated with them, belonging to eleven different records.
Each record will have an ENCOUNTER_ID which can be used to join to the encounter in question

* cohort
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

1. A cohort is created
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

## cohort
* COHORT_ID - A GUID String ('64b755ec-c5ee-42e9-ad28-e743eb1fba66')
* CREATED_AT - A timestamp on creation of the record ('Thu Jun  8 01:11:43 EDT 2017')
* NAME - An optional name associated with the cohort ('RA-Test-1')

## patient

* PATIENT_ID
* ADDRESS_STATE
* DECEASED_INDICATOR
* EMPLOYMENT_STATUS - (more interesting for medicare / medicaid)
* ETHNICITY
* LANGUAGE
* LIVING_SITUATION_STATUS - (should identify homeless, incarcerated, or other at-risk living situations)
* MARITAL_STATUS
* PCP_ID - (should provide {name, specialty} if available)
* RACE
* SEX
* YEAR_OF_BIRTH
* YEAR_OF_DEATH
* ZIP_3 (meaningless for curation, could derive region if no state)

## encounter

* ADMISSION_DTTM - (from claims)
* ADMITTING_PHYSICIAN_ID - (should provide {name, specialty} if available)
* ARRIVAL_DTTM - from emr / outpatient claim
* ATTENDING_PHYSICIAN_ID - map / specialty / npi
* BILLING_PROVIDER_ID - map / specialty / npi
* CLAIM_STATEMENT_FROM_DTTM (dates of service)
* CLAIM_STATEMENT_TO_DTTM (dates of service)
* DISCHARGE_DISPOSITION - transition of patient to other / death
* DISCHARGE_DTTM - claims, useful
* DOCUMENTING_PROVIDER_ID
* DTTM - from claims
* LOCATION - (hospital NPI)
* PLACE_OF_SERVICE
* RENDERING_PROVIDER_ID
* TYPE - OM1 will map this to diff encounter types
* TYPE_OF_BILL - place of service + type of bill will be used to derive things
* (action: hospital NPI might be useful)

### diagnosis

* CODE - (required)
* CODE_TYPE
* CATEGORY
* DOCUMENTING_PROVIDER_ID
* NAME
* STATUS
* PL_FLAG
* ONSET_DTTM
* RESOLUTION_DTTM
* PRINCIPAL_DX_FLAG
* ADMITTING_DX_FLAG
* DISCHARGE_DX_FLAG
* PRESENT_ON_ADMISSION

OM1 Note:

DIAGNOSIS_CODE (ICD/SNOMED code) -> look it up in the rollup table, - condition name

### insurance

* BENEFIT_CODE
* BENEFIT_NAME
* FINANCIAL_CLASS_CODE
* FINANCIAL_CLASS_NAME
* COMPANY_CODE
* COMPANY_NAME
* PLAN_CODE
* PLAN_NAME

### joint_exam

* PERFORMING_PROVIDER_ID
* DOCUMENTING_PROVIDER_ID
* ESR
* STATUS
* TOTAL_NORMAL_28_JOINT_COUNT
* TOTAL_SWOLLEN_28_JOINT_COUNT
* TOTAL_TENDER_28_JOINT_COUNT
* TOTAL_NORMAL_76_JOINT_COUNT
* TOTAL_SWOLLEN_76_JOINT_COUNT
* TOTAL_TENDER_76_JOINT_COUNT


### medication_record

* MEDICATION_RECORD_TYPE - (administration, order, patient_reported)
* ACTION
* ADMINISTERING_PROVIDER_ID
* CODE
* DAW_FLAG
* DAYS_SUPPLY
* DAYS_SUPPLY_DERIVED
* DISCONTINUE_FLAG
* DISPENSE_QUANTITY
* DOCUMENTING_PROVIDER_ID
* DOCUMENTING_PROV_ID
* DOSES_PER_DAY
* DOSES_PER_DAY_DERIVED
* END_DTTM
* EXPIRE_DTTM
* FORM
* FREQUENCY
* GPI
* INFUSION_DOSE
* INFUSION_END_DTTM
* INFUSION_EXPIRY_1_DTTM
* INFUSION_EXPIRY_2_DTTM
* INFUSION_EXPIRY_3_DTTM
* INFUSION_EXPIRY_4_DTTM
* INFUSION_FLAG
* INFUSION_PATIENT_WEIGHT
* INFUSION_PATIENT_WEIGHT_UNIT
* INFUSION_PLANNED_DOSE
* INFUSION_PLANNED_DOSE_UNIT
* INFUSION_RATE
* INFUSION_RATE_UNIT
* INFUSION_REASON_FOR_ADJUSTMENT
* INFUSION_START_DTTM
* INFUSION_THERAPY_TYPE
* INFUSION_VOLUME_INFUSED
* INFUSION_VOLUME_INFUSED_UNIT
* NAME
* NDC
* OR_DISPENSE
* PHARMACY_FILL_NUMBER
* PHARMACY_PRESCRIPTION_ID
* PRESCRIBING_PROVIDER_ID
* PRESCRIPTION_FILL_NUMBER
* REASON_FOR_DISCONTINUATION
* REASON_FOR_START
* REFILLS_AUTHORIZED
* REFILLS_AUTHORIZED_NUMERIC
* ROUTE_OF_ADMIN
* RXNORM
* SIG
* START_DTTM
* STATUS
* STRENGTH
* TOTAL_DOSE
* TYPE
* UNIT


### note

* NAME
* DOCUMENTING_PROVIDER_ID
* TEXT

### observation

* DOCUMENTING_PROV_ID
* NAME
* CODE
* VALUE
* UNIT
* STATUS

### procedure

* ANATOMIC_LOCATION
* BILLING_PROVIDER_ID
* CODE (mapped name is useful)
* CODE_TYPE - ICD9
* DOCUMENTING_PROVIDER_ID
* ORDERING_PROVIDER_ID
* PERFORMING_PROVIDER_ID
* PRINCIPAL_PROCEDURE_FLAG
* QUANTITY
* RESULTS
* REV_CODE (useful for inpatient)
* STATUS


### provider
* DEPARTMENT_LOCAL
* DEPARTMENT_MAPPED
* NPI
* SPECIALTY_CODE_LOCAL
* SPECIALTY_CODE_MAPPED
* SPECIALTY_IS_PRIMARY_FLAG
* SPECIALTY_SEQUENCE_NUMBER
* STATUS_LOCAL
* STATUS_MAPPED
* TYPE_LOCAL
* TYPE_MAPPED
* ZIP_CODE

### questionnaire

* CATEGORY
* CODE
* DOCUMENTING_PROVIDER_ID
* NAME
* RESULT
* RESULT_UNIT
* SUBCATEGORY
* STATUS
* TYPE

### result

* STATUS
* ORDER_ID
* ORDER_CODE
* PANEL_CODE
* PANEL_NAME
* CODE
* NAME
* VALUE
* UNIT
* REFERENCE_RANGE
* LOINC - description would be desired
* PERFORMED_DTTM
* PERFORMING_PROVIDER_ID
* DOCUMENTING_PROVIDER_ID
* MICROBIO_ORGANISM
* MICROBIO_ANTIBIOTIC
* MICROBIO_SENSITIVITY
* MICROBIO_MIC
* ABNORMAL_FLAG
* SPECIMEN_SOURCE
* REFERENCE_RANGE_LOWER
* REFERENCE_RANGE_UPPER

