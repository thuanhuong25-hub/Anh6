<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Grade 6 Interactive Test - AI English Assessment</title>
    <meta name="description" content="AI-powered interactive English testing platform for Grade 6 students">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Nunito', sans-serif;
      }
      @keyframes fade-in-up {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      .animate-fade-in-up {
        animation: fade-in-up 0.6s ease-out;
      }
      .animate-fade-in {
        animation: fade-in 0.5s ease-out;
      }
    </style>
  </head>
  <body class="bg-slate-50 text-slate-900">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
