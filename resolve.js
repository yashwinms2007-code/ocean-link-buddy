import fs from 'fs';

const files = [
  "src/main.tsx",
  "src/pages/Chatbot.tsx",
  "src/pages/Splash.tsx",
  "src/pages/SOS.tsx",
  "src/pages/Settings.tsx",
  "src/pages/Safety.tsx",
  "src/pages/Profile.tsx",
  "src/pages/Notifications.tsx",
  "src/pages/Login.tsx",
  "src/pages/FishMarket.tsx",
  "src/pages/FishDetection.tsx",
  "src/pages/Dashboard.tsx",
  "src/index.css",
  "src/contexts/LanguageContext.tsx",
  "src/components/LanguageSwitcher.tsx",
  "src/components/BottomNav.tsx",
  "src/App.tsx",
  "index.html"
];

let totalFixed = 0;

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if file has conflict markers before replacing
    if (content.includes('<<<<<<< HEAD')) {
      // Keep HEAD (our work), discard the incoming template
      const newContent = content.replace(/<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n[\s\S]*?\r?\n>>>>>>> [a-f0-9]+\r?\n?/g, '$1\n');
      
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('✅ Fixed:', file);
      totalFixed++;
    } else {
      console.log('⚡ Skipped (No markers):', file);
    }
  } else {
    console.log('❌ File not found:', file);
  }
});

console.log(`\n🎉 Completed! Resolved conflicts in ${totalFixed} files.`);
