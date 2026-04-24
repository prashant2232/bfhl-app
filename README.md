# BFHL Node Hierarchy Explorer

A full-stack web application built for the **SRM Full Stack Engineering Challenge**.
This project accepts node relationships, processes hierarchy trees, detects cycles, handles duplicates, validates invalid inputs, and displays results in an interactive UI.

---

## 🚀 Live Demo

### Frontend

https://bfhl-app-delta.vercel.app

### API Endpoint

```http id="x3m7rt"
POST https://bfhl-app-delta.vercel.app/api/bfhl
```

---

## 📌 Features

* Accepts input like:

```text id="w4x0iv"
A->B
A->C
B->D
```

* Builds hierarchical tree structures
* Detects cycles in graphs
* Removes duplicate edges
* Filters invalid entries
* Calculates maximum depth
* Returns structured JSON response
* Beautiful responsive frontend dashboard

---

## 🛠 Tech Stack

### Frontend

* Next.js
* JavaScript
* CSS / Custom Styling

### Backend

* Next.js API Routes
* Node.js Logic Processing

### Deployment

* Vercel

---

## 📂 Folder Structure

```text id="lf3x3f"
bfhl-app/
├── lib/
│   └── processor.js
├── pages/
│   ├── api/
│   │   └── bfhl.js
│   └── index.js
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── vercel.json
```

---

## 📥 API Request

### Endpoint

```http id="pt1b2l"
POST /api/bfhl
Content-Type: application/json
```

### Sample Body

```json id="s5zaj6"
{
  "data": ["A->B", "A->C", "B->D"]
}
```

---

## 📤 Sample Response

```json id="j1ehk5"
{
  "user_id": "prashantbansal_22042005",
  "email_id": "pb4018@srmist.edu.in",
  "college_roll_number": "RA2311026030180",
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": {
            "D": {}
          },
          "C": {}
        }
      },
      "depth": 3
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

---

## 💻 Run Locally

```bash id="f54qjp"
git clone https://github.com/prashant2232/bfhl-app.git
cd bfhl-app
npm install
npm run dev
```

Open in browser:

```text id="mxhlvx"
http://localhost:3000
```

---

## 🧠 Core Logic

The processing logic is handled inside:

```text id="1dy0v1"
lib/processor.js
```

This file manages:

* Validation
* Tree creation
* Cycle detection
* Duplicate removal
* Depth calculation
* Summary generation

---

## 👨‍💻 Author

**Prashant Bansal**
SRM Institute of Science and Technology

---

## 📌 Challenge Submission

Built for **SRM Full Stack Engineering Challenge – Round 1**
