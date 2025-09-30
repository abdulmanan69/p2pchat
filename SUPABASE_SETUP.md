# Supabase Setup Guide

Follow these steps to properly set up your Supabase project for the P2P Chat application.

## Step 1: Create the signals table

1. Go to your Supabase project dashboard
2. In the left sidebar, click on "Table Editor"
3. Click the "New Table" button
4. Name the table `signals`
5. Add the following columns:

| Column Name | Data Type | Required | Default Value |
|-------------|-----------|----------|---------------|
| id | int8 | Yes | Auto increment |
| room_id | text | Yes | - |
| sender | text | Yes | - |
| sender_name | text | Yes | - |
| target | text | No | - |
| type | text | Yes | - |
| sdp | text | No | - |
| candidate | text | No | - |
| created_at | timestamptz | Yes | now() |

6. Set `id` as the primary key
7. Click "Save"

## Step 2: Enable Row Level Security (RLS)

1. In the table editor, select the `signals` table
2. Click on the "Policies" tab
3. Toggle "Enable Row Level Security" to ON

## Step 3: Create RLS Policies

### Create SELECT policy:
1. Click "New Policy"
2. Select "SELECT" as the operation
3. Give it a name like "Enable read access for all"
4. In the "Using expression" field, enter: `true`
5. Click "Save"

### Create INSERT policy:
1. Click "New Policy"
2. Select "INSERT" as the operation
3. Give it a name like "Enable insert access for all"
4. In the "With check expression" field, enter: `true`
5. Click "Save"

## Step 4: Test the setup

1. Go to the "SQL Editor" in your Supabase dashboard
2. Run this query to test:
   ```sql
   INSERT INTO signals (room_id, sender, sender_name, type) 
   VALUES ('test-room', 'test-user', 'Test User', 'test');
   ```
3. Then run:
   ```sql
   SELECT * FROM signals;
   ```
4. You should see the record you just inserted

## Troubleshooting

If you encounter issues:

1. **Check that all column names match exactly** (case-sensitive)
2. **Verify that RLS is enabled** for the table
3. **Confirm both policies are created** with the correct expressions
4. **Make sure you're using the anon key** (not the service key) in your config.js
5. **Check the browser console** for any JavaScript errors

## Common Errors

1. **"relation 'signals' does not exist"**: The table wasn't created properly
2. **"permission denied"**: RLS policies aren't set up correctly
3. **"Invalid JWT"**: The anon key is incorrect
4. **"Connection refused"**: The Supabase URL is incorrect

If you continue to have issues, try using the supabase_test.html file included in the project to isolate the problem.