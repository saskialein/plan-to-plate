# 🍽️ Plan to Plate 🥦

Plan to Plate is an AI-powered meal planning app designed to help people create weekly meal plans based on their vegetable box contents and dietary preferences. The app generates customisable meal plans with clickable recipe links and serves as a recipe book for users to store and manage their favourite recipes. 

## ⚙️ Tech Stack
- FastAPI
    - SQLModel (ORM)
    - Pydantic (Data validation and Settings management)
    - PostgreSQL with Vector Database
- React
    - TypeScript, Vite, Tanstack Router, React Query, React Hook Form
    - Chakra UI
    - Dark mode support
- LangChain (Framework for LLM applications)
   - Meta's llama3-70b-8192 as development LLM
- Docker
- Secure password hashing
- JWT token authentication
- Email-based password recovery
- Traefik as a reverse proxy/load balancer

## 🔋 Features
Feature List:
- **Custom Meal Planning Form**: Input the number of people, plan start date, preferred diet, and list of vegetables from your weekly box.
- **AI-Generated Meal Plans**: Receive a table-formatted meal plan for breakfast, lunch, and dinner, complete with clickable links to recipes or AI-generated instructions.
- **Save and View Meal Plans**: Save meal plans with a specified start date, and easily access your saved plans for future reference.
- **Recipe Book**: Store recipes as URLs or images with titles and descriptions. Indicate if a recipe should be considered for future meal plans based on diet and vegetable availability.
- **AI-Integrated Recipe Matching**: Recipes are stored in a vector database, making them accessible for AI to include in meal plans.
- **User Recipe Comments**: Add notes to recipes, like adjusting ingredient quantities, for personalized future reference.
- **Invite-Only Access**: The app is private and requires authentication.


