document.getElementById("AIFunFactBtn").addEventListener("click", function() {
    const funFact = document.getElementById("fun_fact").value;

    console.log("fetching fun fact");
    console.log("fun_fact: " + funFact);
    
    async function fetchFunFact() {
        try {
            const response = await fetch("/ai/funfact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ fun_fact: funFact })
            });
            const data = await response.json();
            document.getElementById("funFactResult").innerText = JSON.stringify(data, null, 2);
        } catch (error) {
            console.error("Error fetching fun fact:", error);
            document.getElementById("funFactResult").innerText = "Web Failed to fetch fun fact", funFact;
        }
    }

    fetchFunFact();
});