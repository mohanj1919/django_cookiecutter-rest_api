INSERT INTO auth_permission(
    content_type_id,
    name,
    codename
)
VALUES (
    6,
    'Can add curation user',
    'add_curationuser'
), (
    6,
    'Can get curation user',
    'get_curationuser'
), (
    6,
    'Can change curation user',
    'change_curationuser'
), (
    6,
    'Can delete curation user',
    'delete_curationuser'
);

INSERT INTO auth_permission(
        content_type_id,
        name,
        codename)
SELECT id,
		'Can get ' || model,
        'get_' || model
FROM public.django_content_type
WHERE app_label IN ('users', 'patients')
AND model != 'curationuser';

WITH r AS (
    SELECT id
    FROM auth_group
    WHERE name = 'admin'
)
INSERT INTO auth_group_permissions(
    group_id,
    permission_id)
SELECT r.id,
    auth_permission.id
FROM r, auth_permission;
