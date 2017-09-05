INSERT INTO auth_group(name) values ('admin'), ('curator');
INSERT INTO curation_user(
    id,
    password,
    is_superuser,
    first_name,
    last_name,
    email,
    password_expiry_on,
    profile_picture,
    is_active,
    is_deleted,
    user_created_on,
    user_created_by,
    is_staff,
    otp_secret_key,
    mfa_type)
VALUES(
    189745,
    'pbkdf2_sha256$30000$K56wiFUmlnvH$UNTOY8YUFZkcKfdUba/XxB5snUKpwhejqXD/F2B990U=',
    false,
    'admin',
    'user',
    'mohan.jagabatthula@ggktech.com',
    CURRENT_DATE + INTERVAL '90 day',
    'PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjQ4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSI0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0zIDV2MTRjMCAxLjEuODkgMiAyIDJoMTRjMS4xIDAgMi0uOSAyLTJWNWMwLTEuMS0uOS0yLTItMkg1Yy0xLjExIDAtMiAuOS0yIDJ6bTEyIDRjMCAxLjY2LTEuMzQgMy0zIDNzLTMtMS4zNC0zLTMgMS4zNC0zIDMtMyAzIDEuMzQgMyAzem0tOSA4YzAtMiA0LTMuMSA2LTMuMXM2IDEuMSA2IDMuMXYxSDZ2LTF6Ii8+CiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==',
    true,
    false,
    NOW(),
    '',
    true,
    'GKG2DTFYRCPZTSXE',
    'google');
INSERT INTO curation_user_groups(curationuser_id, group_id) values(189745,1);
