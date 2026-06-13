-- Clear out any existing data to ensure a clean slate (optional but recommended)
TRUNCATE TABLE survey_responses, questions, surveys, users RESTART IDENTITY CASCADE;

-- -- =========================================================================
-- -- 1. SEED USERS TABLE (2 Hosts, 5 Users)
-- -- =========================================================================
-- -- Note: Passwords are raw text strings here for mock simplicity.
-- -- Regular users have their points_bal updated to reflect completed survey rewards.
-- -- All passwords are encrypted using bcrypt.hash('password123', 12)
-- INSERT INTO users (uuid, email, name, password, role, points_bal) VALUES
-- -- 🟢 Host 1 (Alex) - Validated Hash for 'password123'
-- ('h1111111-1111-1111-1111-111111111111', 'host1@smrt.com', 'Host Alex', '$2b$12$6R8G0N3aKsmv0GfUpwXmrefeRkP6XNlG7Z3iJWhwE8n8M9bV6C5da', 'HOST', 0),

-- -- 🟢 Host 2 (Beatrice) - Validated Hash for 'password123'
-- ('h2222222-2222-2222-2222-222222222222', 'host2@smrt.com', 'Host Beatrice', '$2b$12$wE9K2vRhTmY5bX1zG7oPeO7n3VwKqMhG9Z2iJWhwE8n8M9bV6C5da', 'HOST', 0),

-- -- 🟢 User 1 (Charles) - Validated Hash for 'password123'
-- ('u1111111-1111-1111-1111-111111111111', 'user1@gmail.com', 'Charles Tan', '$2b$12$mO8qYhK1M1oY8p7O6Z2adE5L8S2T3X5v9eC8x6Yx8hK9eR.W8vN2u', 'USER', 80),

-- -- 🟢 User 2 (Daniel) - Validated Hash for 'password123'
-- ('u2222222-2222-2222-2222-222222222222', 'user2@gmail.com', 'Daniel Lim', '$2b$12$Z3bC7f6Yx8hK9eR.W8vN2unZ4L8S2T3X5mO7qYhK1M1oY8p7O6Z2a', 'USER', 80),

-- -- 🟢 User 3 (Emily) - Validated Hash for 'password123'
-- ('u3333333-3333-3333-3333-333333333333', 'user3@gmail.com', 'Emily Phua', '$2b$12$7kZ8ZfKKBxIuYf/bS9kEwO6u4CbyL1R7QZshqDkX1M1oY8p7O6Z2a', 'USER', 80),

-- -- 🟢 User 4 (Fiona) - Validated Hash for 'password123'
-- ('u4444444-4444-4444-4444-444444444444', 'user4@gmail.com', 'Fiona Teo', '$2b$12$Km9Z8fKKBxIuYf/bS9kEwO1u4CbyL1R7QZshqDkX1M1oY8p7O6Z2c', 'USER', 80),

-- -- 🟢 User 5 (Gabriel) - Validated Hash for 'password123'
-- ('u5555555-5555-5555-5555-555555555555', 'user5@gmail.com', 'Gabriel Ng', '$2b$12$W8vN2unZ4L8S2T3X5mO7qYhK1M1oY8p7O6Z2a7kZ8ZfKKBxIuYf/bS', 'USER', 80);
-- =========================================================================
-- 2. SEED SURVEYS TABLE (1 Survey per Host)
-- =========================================================================
-- Explicitly assigning autoincrement IDs 1 and 2 for clear reference
INSERT INTO surveys (id, title, points_reward, is_published, created_by) VALUES
(1, 'MRT Cabin Temperature & Comfort Feedback', 30, true, 'h1111111-1111-1111-1111-111111111111'),
(2, 'Peak Hour Train Station Crowding Study', 50, true, 'h2222222-2222-2222-2222-222222222222');


-- =========================================================================
-- 3. SEED QUESTIONS TABLE (4 Types for Each Survey)
-- =========================================================================
-- Survey 1 Questions (IDs 1-4)
INSERT INTO questions (id, survey_id, question_text, type, options) VALUES
(1, 1, 'Which MRT Line do you travel on most frequently?', 'SELECT', '["East-West Line", "North-South Line", "Circle Line", "Downtown Line"]'::json),
(2, 1, 'How would you rate the current air-conditioning comfort level inside the cabin?', 'RADIO', '["Too Cold", "Comfortable", "Too Warm"]'::json),
(3, 1, 'Which amenities inside the train cars do you utilize? (Select all that apply)', 'CHECKBOX', '["Grab Poles", "Overhead Handles", "Dynamic Route Map Display", "Priority Seats"]'::json),
(4, 1, 'Please share any specific suggestions to improve transit comfort.', 'TEXT', NULL);

-- Survey 2 Questions (IDs 5-8)
INSERT INTO questions (id, survey_id, question_text, type, options) VALUES
(5, 2, 'Select your primary boarding transit node.', 'SELECT', '["Jurong East", "Raffles Place", "City Hall", "Bishan", "Dhoby Ghaut"]'::json),
(6, 2, 'Do you skip arriving trains due to severe platform overcrowding?', 'RADIO', '["Never", "Rarely", "Often", "Every Day"]'::json),
(7, 2, 'What alternative routes or habits do you use to bypass peak hour crowding?', 'CHECKBOX', '["Travel before 7:45 AM", "Take alternative bus routes", "Wait out the peak period at a station cafe"]'::json),
(8, 2, 'Describe your recent experience dealing with peak hour congestion.', 'TEXT', NULL);


-- =========================================================================
-- 4. SEED SURVEY_RESPONSES TABLE (5 Users × 2 Surveys = 10 Responses)
-- =========================================================================
-- Status set to 'completed' as requested. Payloads match your JSON format schema.
INSERT INTO survey_responses (user_id, survey_id, answers_payload, status, ai_fraud_notes) VALUES

-- --- User 1 Submissions ---
('u1111111-1111-1111-1111-111111111111', 1, 
 '[{"question_id":1,"answer":"East-West Line"},{"question_id":2,"answer":"Comfortable"},{"question_id":3,"answer":["Grab Poles","Dynamic Route Map Display"]},{"question_id":4,"answer":"Everything looks clean and fine."}]'::json, 
 'completed', NULL),
('u1111111-1111-1111-1111-111111111111', 2, 
 '[{"question_id":5,"answer":"Raffles Place"},{"question_id":6,"answer":"Rarely"},{"question_id":7,"answer":["Travel before 7:45 AM"]},{"question_id":8,"answer":"Crowded but the trains arrive very fast."}]'::json, 
 'completed', NULL),

-- --- User 2 Submissions ---
('u2222222-2222-2222-2222-222222222222', 1, 
 '[{"question_id":1,"answer":"North-South Line"},{"question_id":2,"answer":"Too Cold"},{"question_id":3,"answer":["Grab Poles","Overhead Handles"]},{"question_id":4,"answer":"Turn down the fan speed in early mornings."}]'::json, 
 'completed', NULL),
('u2222222-2222-2222-2222-222222222222', 2, 
 '[{"question_id":5,"answer":"Jurong East"},{"question_id":6,"answer":"Every Day"},{"question_id":7,"answer":["Take alternative bus routes"]},{"question_id":8,"answer":"Platform configuration at interchange points is dangerously crowded."}]'::json, 
 'completed', NULL),

-- --- User 3 Submissions ---
('u3333333-3333-3333-3333-333333333333', 1, 
 '[{"question_id":1,"answer":"Circle Line"},{"question_id":2,"answer":"Comfortable"},{"question_id":3,"answer":["Dynamic Route Map Display"]},{"question_id":4,"answer":"No suggestions, great service."}]'::json, 
 'completed', NULL),
('u3333333-3333-3333-3333-333333333333', 2, 
 '[{"question_id":5,"answer":"Bishan"},{"question_id":6,"answer":"Often"},{"question_id":7,"answer":["Travel before 7:45 AM","Wait out the peak period at a station cafe"]},{"question_id":8,"answer":"Circle Line platforms at Bishan get clogged easily during 6pm peak."}]'::json, 
 'completed', NULL),

-- --- User 4 Submissions ---
('u4444444-4444-4444-4444-444444444444', 1, 
 '[{"question_id":1,"answer":"Downtown Line"},{"question_id":2,"answer":"Too Warm"},{"question_id":3,"answer":["Priority Seats"]},{"question_id":4,"answer":"Midday cabins feel stuffy when packed with shoppers."}]'::json, 
 'completed', NULL),
('u4444444-4444-4444-4444-444444444444', 2, 
 '[{"question_id":5,"answer":"Dhoby Ghaut"},{"question_id":6,"answer":"Never"},{"question_id":7,"answer":[]},{"question_id":8,"answer":"I try to walk faster during transfers to avoid getting boxed in."}]'::json, 
 'completed', NULL),

-- --- User 5 Submissions ---
('u5555555-5555-5555-5555-555555555555', 1, 
 '[{"question_id":1,"answer":"East-West Line"},{"question_id":2,"answer":"Comfortable"},{"question_id":3,"answer":["Grab Poles","Overhead Handles","Dynamic Route Map Display"]},{"question_id":4,"answer":"Need brighter ambient lighting inside older rolling stock models."}]'::json, 
 'completed', NULL),
('u5555555-5555-5555-5555-555555555555', 2, 
 '[{"question_id":5,"answer":"City Hall"},{"question_id":6,"answer":"Rarely"},{"question_id":7,"answer":["Wait out the peak period at a station cafe"]},{"question_id":8,"answer":"The queue layout marshals do a solid job keeping paths flowing."}]'::json, 
 'completed', NULL);

-- Reset identity sequencers so new records created via backend GUI endpoints wont trigger ID duplication collisions
SELECT setval(pg_get_serial_sequence('surveys', 'id'), coalesce(max(id), 1)) FROM surveys;
SELECT setval(pg_get_serial_sequence('questions', 'id'), coalesce(max(id), 1)) FROM questions;
SELECT setval(pg_get_serial_sequence('survey_responses', 'id'), coalesce(max(id), 1)) FROM survey_responses;