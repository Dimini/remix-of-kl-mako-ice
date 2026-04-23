
WITH seed(cid, p1, p2, total, badge) AS (
  VALUES
    ('4d4baaf4-db7b-4502-b3fc-9599da852b23'::uuid, 85::numeric, 82::numeric, 83::numeric, 'green'::badge_color),
    ('e8bdcb7d-aaf4-41ba-b73d-3f86ad1a59c1'::uuid, 78, 84, 82, 'green'),
    ('fcb12b92-319d-49b0-b5f6-51e5e60be642'::uuid, 60, 58, 59, 'yellow'),
    ('f57416cd-7fed-4119-9bb5-8aa8ab8cddba'::uuid, 88, 90, 89, 'green'),
    ('bcf1e779-7fbc-480d-8ea6-50e942c9c77d'::uuid, 40, 38, 39, 'orange'),
    ('b2e82b4b-4e9a-4127-9d75-8f645f6312d2'::uuid, 70, 72, 71, 'yellow'),
    ('14f144bc-353b-4258-9c02-e4ded4245985'::uuid, 60, 65, 63, 'yellow'),
    ('c26118f2-2b93-4bc5-961f-d52b0cae40e2'::uuid, 58, 62, 60, 'yellow'),
    ('9100f3d8-247b-4a08-8363-a326c60f8a3e'::uuid, 82, 80, 81, 'green'),
    ('648e1aea-f154-4ac8-aa56-b1e40f8bfa4b'::uuid, 35, 32, 33, 'orange'),
    ('28e32710-6ea0-44f1-827e-6603dd1d71e0'::uuid, 70, 66, 68, 'yellow'),
    ('e7db1f11-6641-461f-bd99-e543775b98af'::uuid, 56, 60, 58, 'yellow'),
    ('05c0c725-28a1-4a49-9437-a0a96a88f780'::uuid, 36, 32, 34, 'orange'),
    ('329fe3ac-9e69-4201-8e92-d041d84deb7d'::uuid, 25, 22, 23, 'red'),
    ('56e8b9bd-b2df-489d-83c8-5c05ebfd9f78'::uuid, 42, 38, 40, 'orange'),
    ('f8c6ff40-29b0-4d33-9873-4aaa1daa745b'::uuid, 81, 78, 79, 'yellow'),
    ('ffa8ed3d-1eea-4b1b-a4d0-d9a46a4da206'::uuid, 38, 34, 36, 'orange'),
    ('60ec55fa-1cf4-4940-af87-165c89bde7ec'::uuid, 84, 86, 85, 'green'),
    ('4e2bf4b6-9e06-4a19-acce-c30e2d6bb866'::uuid, 88, 82, 84, 'green'),
    ('4ad45509-5333-4727-a4cf-37bb6a289a97'::uuid, 60, 58, 59, 'yellow'),
    ('68332fb7-981d-4dae-9385-ec9ac2305861'::uuid, 82, 80, 81, 'green'),
    ('9daba34a-7678-41a6-8449-0ee422247f16'::uuid, 35, 32, 33, 'orange'),
    ('8f83d6f0-8a04-471b-aace-f22cd93b0100'::uuid, 78, 86, 83, 'green'),
    ('7b5833e5-93bd-425f-8ebf-acfd1dbef219'::uuid, 60, 64, 62, 'yellow'),
    ('b2b025f8-3915-476f-9523-5fc704149805'::uuid, 70, 65, 67, 'yellow'),
    ('eef730a5-13b6-43b0-b765-bb2f85e0b5a8'::uuid, 28, 26, 27, 'red'),
    ('7146fdcf-0374-4df1-b1a4-64da189b0500'::uuid, 22, 18, 20, 'red'),
    ('8fbf5926-8f12-4eec-bbdd-1783e0d21811'::uuid, 30, 26, 28, 'red'),
    ('c5441eb6-f6ba-4f5e-9266-27c9460ad386'::uuid, 56, 52, 54, 'orange'),
    ('2f85db9e-dc18-437f-ae54-703649c5d457'::uuid, 84, 88, 86, 'green'),
    ('955ff997-a0f6-4a23-b216-baf5e0deab61'::uuid, 82, 80, 81, 'green'),
    ('2f5be061-b7ce-4fad-ae32-3c3a7ac4d9fb'::uuid, 60, 58, 59, 'yellow'),
    ('93f74951-db5e-48c1-a6b2-71bc43bb87f1'::uuid, 86, 84, 85, 'green'),
    ('c9e55492-dfd9-43d9-95b9-1908134876c3'::uuid, 38, 34, 36, 'orange'),
    ('211f421e-7ae7-4d81-9a01-9e46bb6c4758'::uuid, 78, 82, 80, 'green'),
    ('b534c44b-82ef-4d57-8aff-25cb3c996b8b'::uuid, 25, 22, 23, 'red'),
    ('a03ad74c-7595-45ee-83fa-d020ffe0ca81'::uuid, 70, 68, 69, 'yellow'),
    ('8b48969b-0237-4cca-b623-07e2bbcb7e85'::uuid, 38, 34, 36, 'orange'),
    ('6feb5feb-adac-44d6-b1e2-250c72738dcf'::uuid, 42, 38, 40, 'orange'),
    ('22c5580b-dac1-43ba-b562-99072de54ed1'::uuid, 28, 24, 26, 'red'),
    ('287f421c-72eb-43f6-8db2-f75fca82ce69'::uuid, 36, 32, 34, 'orange'),
    ('f451462d-ef9f-441d-b135-5e1852d68f13'::uuid, 82, 78, 80, 'green'),
    ('2ce675ed-31df-462e-b19d-7308303191b1'::uuid, 60, 58, 59, 'yellow'),
    ('dd0c05ea-4bc2-4ceb-b6d9-10226843685f'::uuid, 35, 31, 33, 'orange'),
    ('f3a3e4d9-e2d8-4cbe-8bc7-dd73f4393ec5'::uuid, 40, 36, 38, 'orange')
)
INSERT INTO public.scores (
  candidate_id, pillar1_score, pillar2_score, total_score, badge,
  formula_version, is_approved, approved_at, version_number
)
SELECT s.cid, s.p1, s.p2, s.total, s.badge,
       'v1.0', true, now(), 1
FROM seed s
WHERE NOT EXISTS (SELECT 1 FROM public.scores sc WHERE sc.candidate_id = s.cid);
