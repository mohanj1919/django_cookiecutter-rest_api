INSERT INTO curation_email_template (
    is_active,
    created_on,
    created_by,
    updated_on,
    updated_by,
    id,
    name,
    subject,
    template,
    place_holders,
    display_name
)
VALUES (
    true,
    '2017-08-09 07:45:53.92703+00',
    NULL,
    '2017-08-09 10:44:47.173593+00',
    NULL,
    1,
    'welcome_email',
    'Welcome to OM1 curation application Email Template Edited',
    '<h1><strong>Welcome {{name}},</strong></h1><p><a href="{{action_url}}" target="_blank" style="color: rgb(17, 85, 204);">Set your password</a><span style="color: rgb(80, 0, 80);">&nbsp;to activate your OM1 Curation user account.</span><strong>
    Instructions</strong></p><p><br></p><p>Apple or Android Smart Phone Users: Download the Google Authenticator application (Go to either the Apple App Store or Google Play store and search for Google Authenticator)</p><ol><li>Click on the "Set your password" link above in this email.</li><li>Create a valid password.</li></ol><p><br></p><p>Smart phone Users:</p><ol><li>After setting your password, you will be presented a QR code.</li><li>Open the Google Authenticator App and tap on the "+" icon.</li><li>Select the option to Scan barcode.</li><li>Scan the QR code with your phone, then click on the log in button.</li><li>You will be asked to enter an authentication code from the Google Authenticator app when you access the Curation App in the future.</li></ol><p><br></p><p>If you do not have a smart phone:</p><ol><li>After setting your password you will receive a text message with your authentication code.</li><li>Enter the authentication code and click on the log in button.</li><li>You will be asked to enter an authentication code that is texted to you when you access the Curation App in the future.</li></ol><p><br></p><p>If you have already set up your password go directly to the&nbsp;<a href="{{login_url}}" target="_blank" style="color: rgb(17, 85, 204);">Curation App Login</a>&nbsp;page.</p><p><br></p><p>Thanks,&nbsp;</p><p>OM1 Team</p><p><br></p>',
    '{{name}}, {{action_url}}, {{support_email}}, {{login_url}}',
    'Welcome Email'
), (
    true,
    '2017-08-09 11:33:05.743567+00',
    NULL,
    '2017-08-09 11:33:05.744456+00',
    NULL,
    3,
    'reset_password_email',
    'Reset Password for OM1 application', '<h1><strong>Hi {{name}},</strong></h1><p>This&nbsp;password&nbsp;reset&nbsp;is only valid for the next 24 hours.</p><p><br></p><ol><li><a href="{{action_url}}" target="_blank" style="color: rgb(17, 85, 204);">Reset&nbsp;your&nbsp;password</a><strong style="color: rgb(34, 34, 34);">
    Instructions:</strong>Click on the&nbsp;Reset&nbsp;your&nbsp;password&nbsp;button.</li><li>Create a new valid&nbsp;password.</li><li>If you had installed Google Authenticator on your smart phone enter the authentication code.</li><li>Click on login to access the Curation App.</li></ol><p><br></p><p>Thanks,&nbsp;</p><p>The OM1 Team</p>',
    '{{name}}, {{action_url}}, {{support_email}}, {{login_url}}',
    'Reset Password Email'
);
