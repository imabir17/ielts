-- 1. Create Tables
CREATE TABLE organizations (
  id text PRIMARY KEY,
  name text,
  code text,
  location text,
  contact_email text,
  subscription_tier text,
  max_seats integer,
  max_exams_per_month integer,
  exams_used_this_month integer,
  student_count integer,
  active_tests integer,
  status text,
  created_date text,
  org_admin_name text,
  org_admin_email text,
  password text,
  package_ids jsonb
);

CREATE TABLE packages (
  id text PRIMARY KEY,
  name text,
  price integer,
  id_limit integer, -- Use -1 or null for unlimited if needed
  exam_limit integer,
  description text
);

CREATE TABLE managers (
  id text PRIMARY KEY,
  name text,
  email text,
  password text,
  role text
);

CREATE TABLE students (
  id text PRIMARY KEY,
  name text,
  student_id text,
  email text,
  org_id text REFERENCES organizations(id),
  assigned_tests jsonb,
  completed_tests integer,
  average_band numeric,
  password text
);

CREATE TABLE tests (
  id text PRIMARY KEY,
  title text,
  category text,
  total_duration_minutes integer,
  status text,
  tier_access text,
  question_count integer,
  created_date text,
  reading jsonb,
  listening jsonb,
  listening_audio_url text,
  writing jsonb,
  speaking jsonb
);

CREATE TABLE exam_logs (
  id text PRIMARY KEY,
  student_name text,
  student_id text REFERENCES students(id),
  org_name text,
  org_id text REFERENCES organizations(id),
  test_title text,
  test_id text REFERENCES tests(id),
  completed_at text,
  status text,
  modules_taken jsonb,
  answers jsonb,
  scores jsonb,
  overall_band numeric,
  writing_feedback text
);

CREATE TABLE speaking_requests (
  id text PRIMARY KEY,
  student_id text REFERENCES students(id),
  org_id text REFERENCES organizations(id),
  test_id text REFERENCES tests(id),
  status text,
  scheduled_date text,
  type text,
  link text,
  requested_at text
);

-- 2. Insert Seed Data
INSERT INTO packages (id, name, price, id_limit, exam_limit, description)
VALUES 
  ('pkg-1', 'Starter Plan', 49, 50, 100, 'Perfect for small coaching centers. Up to 50 students.'),
  ('pkg-2', 'Growth Plan', 99, 150, 300, 'For growing academies. Up to 150 students.'),
  ('pkg-3', 'Enterprise Plan', 199, -1, -1, 'Unlimited students and unlimited exams.');

INSERT INTO organizations (id, name, code, location, contact_email, subscription_tier, max_seats, max_exams_per_month, exams_used_this_month, student_count, active_tests, status, created_date, org_admin_name, org_admin_email, password, package_ids)
VALUES ('org-1', 'Apex IELTS Academy', 'APEX-DHK', 'Dhanmondi, Dhaka', 'contact@apex-dkl.com', 'Enterprise', 250, 500, 342, 142, 8, 'active', '2025-11-10', 'Rashid Khan', 'rashid@apex.com', 'password123', '["pkg-3"]');

INSERT INTO managers (id, name, email, password, role)
VALUES ('superadmin', 'Super Admin HQ', 'admin@mockielts.com', 'admin123', 'superadmin');

INSERT INTO tests (id, title, category, total_duration_minutes, status, tier_access, question_count, created_date, reading, listening, listening_audio_url, writing, speaking)
VALUES (
  'test-ielts-01', 
  'IELTS Academic Official Computer Practice Test 01', 
  'Academic', 
  165, 
  'published', 
  'All Orgs', 
  40, 
  '2026-02-01',
  '[{"id":"pas-1","passageNumber":1,"title":"Passage 1: The Architecture of Coral Reef Ecosystems","content":"[Paragraph A] Coral reefs are among the most biodiverse ecosystems on Earth, occupying less than 0.1% of the ocean floor while harboring roughly 25% of all marine species. These complex biological structures are constructed primarily by stony corals—colonial polyps that secrete calcium carbonate skeletons over thousands of years.\n\n[Paragraph B] The foundational architecture of a coral reef is created by hermatypic corals in symbiosis with photosynthetic dinoflagellates known as zooxanthellae. The zooxanthellae reside within the coral polyps'' gastrodermal tissues, receiving shelter and inorganic nutrients like nitrogen and phosphorus. In return, the algae photosynthesize and translocate up to 90% of their organic carbon compounds directly to the coral host, fueling rapid skeleton accretion.\n\n[Paragraph C] However, marine scientists have recently documented widespread physiological stress in coral communities due to elevated sea surface temperatures. When ocean waters exceed seasonal historical maximums by as little as 1°C to 2°C for extended periods, the photosynthetic machinery of zooxanthellae becomes impaired, producing toxic reactive oxygen species. To protect themselves, coral polyps expel their algal symbionts in a process termed \"coral bleaching.\"\n\n[Paragraph D] Stripped of their vibrant microscopic residents, the translucent corals expose their stark white calcium carbonate skeletons. If sea temperatures return to baseline within a critical window of several weeks, corals can reacquire zooxanthellae from the water column or multiply remnant populations. Conversely, prolonged thermal stress leads to eventual coral starvation, tissue necrosis, and colonization by turf algae, converting intricate reef habitats into barren rubble fields.","questions":[{"id":"q-1","questionNumber":1,"type":"multiple_choice_single","prompt":"1. What proportion of the ocean floor is covered by coral reefs?","options":["A. Less than 0.1%","B. Approximately 25%","C. Exactly 10%","D. Over 50%"],"correctAnswer":"A. Less than 0.1%","instruction":"Choose the correct letter A, B, C, or D.","helpGuide":"Click on the radio button corresponding to the single correct option."},{"id":"q-2","questionNumber":2,"type":"true_false_ng","prompt":"2. Zooxanthellae provide up to 90% of their organic carbon to the coral host.","options":["TRUE","FALSE","NOT GIVEN"],"correctAnswer":"TRUE","instruction":"Select TRUE, FALSE, or NOT GIVEN.","helpGuide":"Choose TRUE if the statement agrees with the text, FALSE if it contradicts, or NOT GIVEN if there is no information."},{"id":"q-3","questionNumber":3,"type":"yes_no_ng","prompt":"3. Marine scientists predicted coral bleaching events decades before they occurred.","options":["YES","NO","NOT GIVEN"],"correctAnswer":"NOT GIVEN","instruction":"Select YES, NO, or NOT GIVEN.","helpGuide":"Choose YES if the statement agrees with the writer claims, NO if it contradicts, or NOT GIVEN if impossible to tell."},{"id":"q-4","questionNumber":4,"type":"matching_headings","prompt":"4. Match the heading to Paragraph B.","instruction":"Drag the correct heading into the drop box.","itemsToMatch":[{"id":"h-1","text":"i. Symbiotic Relationship & Carbon Translocation"},{"id":"h-2","text":"ii. Thermal Stress & Bleaching Mechanism"},{"id":"h-3","text":"iii. Global Marine Species Distribution"}],"categories":[{"id":"p-B","title":"Paragraph B Heading"}],"correctAnswer":"i. Symbiotic Relationship & Carbon Translocation","helpGuide":"Click and drag a heading into the target paragraph box."},{"id":"q-5","questionNumber":5,"type":"sentence_completion","prompt":"5. When ocean waters exceed historical maximums, zooxanthellae produce toxic ________.","instruction":"Write NO MORE THAN THREE WORDS from the passage. You can copy text directly from the passage.","correctAnswer":"reactive oxygen species","helpGuide":"Type your answer or select words in the passage and paste them directly into the text box."},{"id":"q-6","questionNumber":6,"type":"short_answer","prompt":"6. What process turns corals white when polyps expel algae?","instruction":"Write NO MORE THAN TWO WORDS from the passage.","correctAnswer":"coral bleaching","helpGuide":"Write your answer in the box."}]}]',
  '[{"id":"lis-1","title":"Section 1: Student Accommodation Inquiry","duration":180,"questions":[{"id":"q-l1","questionNumber":1,"type":"text-input","prompt":"1. Preferred type of accommodation:","correctAnswer":"studio apartment"}]}]',
  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c2680a424e.mp3?filename=ambient-piano-amp-strings-10711.mp3',
  '[{"id":"wrt-1","taskNumber":1,"title":"Task 1: Academic Data Analysis","prompt":"The chart below shows the proportion of energy generated from renewable sources...","minWords":150,"recommendedTime":20},{"id":"wrt-2","taskNumber":2,"title":"Task 2: Essay Prompt","prompt":"Discuss both views and give your own opinion...","minWords":250,"recommendedTime":40}]',
  '[{"id":"spk-1","partNumber":1,"topic":"Introduction & Hometown","prompts":["Could you tell me your full name?"]}]'
);

INSERT INTO students (id, name, student_id, email, org_id, assigned_tests, completed_tests, average_band, password)
VALUES ('std-1', 'Sarah Jenkins', 'STU-8821', 'sarah.j@example.com', 'org-1', '["test-ielts-01"]', 3, 7.5, 'student123');
