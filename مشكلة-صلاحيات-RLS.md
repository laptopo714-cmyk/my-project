I am working on a React + Supabase project and I’m facing errors when fetching videos and sections.

Here are the detailed errors:

1. Fetching videos with related section:

```http
GET https://<project>.supabase.co/rest/v1/videos?select=*,sections(title)&offset=0&limit=10&order=created_at.desc
```

Error:

```
Error fetching videos: {
  code: 'PGRST200',
  message: "Could not find a relationship between 'videos' and 'sections' in the schema cache",
  details: "Searched for a foreign key relationship between 'videos' and 'sections' in the schema 'public', but no matches were found.",
  hint: "Perhaps you meant 'users' instead of 'videos'."
}
```

2. Fetching sections with filter:

```http
HEAD https://<project>.supabase.co/rest/v1/sections?select=*&status=eq.published
```

Error:

```
400 (Bad Request)
```

3. Fetching featured sections:

```http
HEAD https://<project>.supabase.co/rest/v1/sections?select=*&featured=eq.true
```

Error:

```
400 (Bad Request)
```

4. Fetching videos with status:

```http
HEAD https://<project>.supabase.co/rest/v1/videos?select=*&status=eq.published
```

Error:

```
400 (Bad Request)
```

---

### What I need from you:

1. Explain clearly why Supabase/PostgREST is returning:

   - `PGRST200` (missing relationship between `videos` and `sections`)
   - `400 Bad Request` (invalid column filters like `status`, `featured`)

2. Confirm whether I need to **create the `videos` and `sections` tables manually** or if they should exist by default.

3. Provide the correct **SQL schema** for both tables with reasonable columns:

   - `sections`: `id`, `title`, `status`, `featured`, `created_at`
   - `videos`: `id`, `title`, `status`, `section_id` (FK to sections.id), `created_at`

4. Show me the correct way to define a **foreign key relationship** between `videos.section_id` and `sections.id`, so that the query  
   `select=*,sections(title)` works correctly.

5. Correct the REST queries:

   - Fetch all videos with their related section title
   - Fetch only published sections
   - Fetch only featured sections
   - Fetch only published videos

6. Provide any necessary **frontend code adjustments** (React + Supabase client) to fix these errors.

---

### Deliverables I expect:

1. SQL schema to create the missing tables and relationships.
2. Fixed queries (REST style).
3. Adjusted frontend query examples using Supabase client.

I am working on a React + Supabase project and I’m facing errors when fetching videos and sections.

Here are the detailed errors:

1. Fetching videos with related section:

```http
GET https://<project>.supabase.co/rest/v1/videos?select=*,sections(title)&offset=0&limit=10&order=created_at.desc
```

Error:

```
Error fetching videos: {
  code: 'PGRST200',
  message: "Could not find a relationship between 'videos' and 'sections' in the schema cache",
  details: "Searched for a foreign key relationship between 'videos' and 'sections' in the schema 'public', but no matches were found.",
  hint: "Perhaps you meant 'users' instead of 'videos'."
}
```

2. Fetching sections with filter:

```http
HEAD https://<project>.supabase.co/rest/v1/sections?select=*&status=eq.published
```

Error:

```
400 (Bad Request)
```

3. Fetching featured sections:

```http
HEAD https://<project>.supabase.co/rest/v1/sections?select=*&featured=eq.true
```

Error:

```
400 (Bad Request)
```

4. Fetching videos with status:

```http
HEAD https://<project>.supabase.co/rest/v1/videos?select=*&status=eq.published
```

Error:

```
400 (Bad Request)
```

---

### What I need from you:

1. Explain clearly why Supabase/PostgREST is returning:

   - `PGRST200` (missing relationship between `videos` and `sections`)
   - `400 Bad Request` (invalid column filters like `status`, `featured`)

2. Confirm whether I need to **create the `videos` and `sections` tables manually** or if they should exist by default.

3. Provide the correct **SQL schema** for both tables with reasonable columns:

   - `sections`: `id`, `title`, `status`, `featured`, `created_at`
   - `videos`: `id`, `title`, `status`, `section_id` (FK to sections.id), `created_at`

4. Show me the correct way to define a **foreign key relationship** between `videos.section_id` and `sections.id`, so that the query  
   `select=*,sections(title)` works correctly.

5. Correct the REST queries:

   - Fetch all videos with their related section title
   - Fetch only published sections
   - Fetch only featured sections
   - Fetch only published videos

6. Provide any necessary **frontend code adjustments** (React + Supabase client) to fix these errors.

---

### Deliverables I expect:

1. SQL schema to create the missing tables and relationships.
2. Fixed queries (REST style).
3. Adjusted frontend query examples using Supabase client.
