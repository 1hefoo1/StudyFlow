/* ==========================================================
   StudyFlow
   Core Application
   Version 0.1.0
========================================================== */

class StudyFlow {

    constructor() {

        this.currentPage = "dashboard";

        this.init();

    }

    init() {

        this.cacheDOM();

        this.bindEvents();

        this.loadTheme();

        this.updateGreeting();

        this.startClock();

        this.navigate("dashboard");

        console.log("✅ StudyFlow Initialized");

    }

    /* ---------------------------------- */

    cacheDOM() {

        this.themeButton = document.getElementById("themeToggle");

        this.pageTitle = document.getElementById("page-title");

        this.navButtons = document.querySelectorAll(".nav-item");

        this.pages = document.querySelectorAll(".page");

        this.welcomeTitle = document.querySelector(".welcome-card h2");

    }

    /* ---------------------------------- */

    bindEvents() {

        this.themeButton.addEventListener("click", () => {

            this.toggleTheme();

        });

        this.navButtons.forEach(button => {

            button.addEventListener("click", () => {

                const page = button.dataset.page;

                this.navigate(page);

            });

        });

    }

    /* ---------------------------------- */

    navigate(pageName) {

        this.currentPage = pageName;

        this.pages.forEach(page => {

            page.classList.remove("active-page");

        });

        const active = document.getElementById(pageName + "-page");

        if (active) {

            active.classList.add("active-page");

        }

        this.navButtons.forEach(btn => {

            btn.classList.remove("active");

        });

        document
            .querySelector(`[data-page="${pageName}"]`)
            ?.classList.add("active");

        this.pageTitle.textContent =

            pageName.charAt(0).toUpperCase() +

            pageName.slice(1);

    }

    /* ---------------------------------- */

    loadTheme() {

        const saved = localStorage.getItem("studyflow-theme");

        if (!saved) return;

        document.body.classList.remove("dark", "light");

        document.body.classList.add(saved);

    }

    /* ---------------------------------- */

    toggleTheme() {

        const body = document.body;

        const dark = body.classList.contains("dark");

        body.classList.remove("dark", "light");

        body.classList.add(dark ? "light" : "dark");

        localStorage.setItem(

            "studyflow-theme",

            dark ? "light" : "dark"

        );

    }

    /* ---------------------------------- */

    updateGreeting() {

        if (!this.welcomeTitle) return;

        const hour = new Date().getHours();

        let greeting = "";

        if (hour >= 5 && hour < 12)

            greeting = "Good Morning ☀️";

        else if (hour >= 12 && hour < 17)

            greeting = "Good Afternoon 🌤";

        else if (hour >= 17 && hour < 22)

            greeting = "Good Evening 🌙";

        else

            greeting = "Burning the midnight oil? 🌌";

        this.welcomeTitle.textContent = greeting;

    }

    /* ---------------------------------- */

    startClock() {

        setInterval(() => {

            this.updateGreeting();

        }, 60000);

    }

}

/* ========================================================== */

window.addEventListener("DOMContentLoaded", () => {

    new StudyFlow();

});