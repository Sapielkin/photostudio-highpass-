document.addEventListener("DOMContentLoaded", () => {
    const elements = {
        burgerContainer: document.querySelector(".header__burger-menu"),
        headerBurger: document.querySelector(".header__burger-button"),
        buttonClose: document.querySelector(".header__burger-close"),
    };


    elements.buttonClose.addEventListener("click", function () {
        gsap.to(elements.burgerContainer, {
            duration: 0.3,
            top: "-100vh",
            opacity: 0,
            ease: "power2.in",
        });
    });

    elements.headerBurger.addEventListener("click", function () {
        gsap.to(elements.burgerContainer, {
            duration: 0.3,
            top: "0",
            opacity: 1,
            ease: "power2.in",
        });
    });
})