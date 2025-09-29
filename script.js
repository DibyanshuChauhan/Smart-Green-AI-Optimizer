document.addEventListener("DOMContentLoaded", () => {
    const impactData = {
        city: {
            name: "City/Municipalities",
            title: "Optimized Spending & Cooling",
            description:
                'Maximize your budget ROI. We reduce the deadly "Heat Island" effect and ensure funds are spent on the most effective trees.',
            labels: ["Heat Reduction (ΔT)", "Budget ROI Maximize"],
            data: [18, 20],
            backgroundColor: [
                "rgba(22, 101, 52, 0.7)",
                "rgba(22, 101, 52, 0.4)",
            ],
            tooltip: [
                "15-20% reduction in temperature difference in target zones.",
                "Every dollar spent results in maximum cooling impact.",
            ],
        },
        planners: {
            name: "Planning/Engineering",
            title: "Infrastructure Protection & Savings",
            description:
                "Our 3D maps avoid utility conflicts and help manage rainwater, leading to significant annual cost reductions.",
            labels: ["Stormwater Cost Decrease", "Avoid Utility Damages"],
            data: [7.5, 10],
            backgroundColor: [
                "rgba(21, 128, 61, 0.7)",
                "rgba(21, 128, 61, 0.4)",
            ],
            tooltip: [
                "5-10% decrease in annual stormwater management costs.",
                "Precise placement prevents costly damage to pipes, roads, and power lines.",
            ],
        },
        citizens: {
            name: "Citizens & Equity Advocates",
            title: "Social Fairness and Health",
            description:
                "We prioritize planting in vulnerable, low-income districts that need relief from heat and poor air quality the most.",
            labels: ["Prioritized Equity Zones", "Green View Index Increase"],
            data: [100, 100],
            backgroundColor: [
                "rgba(34, 197, 94, 0.7)",
                "rgba(34, 197, 94, 0.4)",
            ],
            tooltip: [
                "Ensures vulnerable communities get equal access to green benefits.",
                "Measurable increase in visible tree cover per neighborhood.",
            ],
        },
        environment: {
            name: "Environmental Teams",
            title: "Measurable Climate Resilience",
            description:
                "Achieve verifiable carbon capture goals and improve local air quality with our species-specific optimization.",
            labels: ["Verifiable CO₂ Capture", "Air Quality Improvement"],
            data: [100, 100],
            backgroundColor: [
                "rgba(74, 222, 128, 0.7)",
                "rgba(74, 222, 128, 0.4)",
            ],
            tooltip: [
                "Track quantifiable CO₂ sequestered per tree over its lifespan.",
                "Healthier ecosystems and reduced city pollution from smart planting.",
            ],
        },
    };

    const API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=";
    const API_KEY = "";

    let currentStakeholderKey = "city";

    const ctx = document.getElementById("impactChart").getContext("2d");
    let impactChart;

    const stakeholderButtons =
        document.querySelectorAll(".stakeholder-btn");
    const impactTitle = document.getElementById("impact-title");
    const impactDescription = document.getElementById("impact-description");


    async function fetchWithExponentialBackoff(payload, maxRetries = 5) {
        let delay = 1000;
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(API_URL + API_KEY, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (response.status === 429 && i < maxRetries - 1) {
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    delay *= 2;
                    continue;
                }

                if (!response.ok) {
                    throw new Error(
                        `API response failed with status: ${response.status}`
                    );
                }

                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text)
                    throw new Error(
                        "AI response text is empty or structured unexpectedly."
                    );
                return text;
            } catch (error) {
                if (i === maxRetries - 1) {
                    console.error("AI API call failed after max retries:", error);
                    throw new Error(
                        "Failed to connect to the AI service. Please try again later."
                    );
                }
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2;
            }
        }
    }

    function updateChart(stakeholder) {
        const data = impactData[stakeholder];
        currentStakeholderKey = stakeholder;

        impactTitle.textContent = data.title;
        impactDescription.textContent = data.description;

        if (impactChart) {
            impactChart.destroy();
        }

        const isPercentage =
            stakeholder === "city" || stakeholder === "planners";
        // Set max for a clear visual scale for percentage benefits
        const yAxisMax = isPercentage ? 25 : undefined;

        impactChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: data.labels.map((label) => label.split(" ")),
                datasets: [
                    {
                        label: "Impact Metric",
                        data: data.data,
                        backgroundColor: data.backgroundColor,
                        borderColor: data.borderColor,
                        borderWidth: 1,
                        borderRadius: 5,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return data.tooltip[context.dataIndex] || "";
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: yAxisMax,
                        title: {
                            display: isPercentage,
                            text: isPercentage ? "Percentage (%)" : "Impact Score",
                        },
                        grid: {
                            display: false,
                        },
                    },
                    y: {
                        ticks: {
                            autoSkip: false,
                        },
                        grid: {
                            display: false,
                        },
                    },
                },
            },
        });

        stakeholderButtons.forEach((btn) => {
            btn.classList.remove("active-stakeholder");
            if (btn.dataset.stakeholder === stakeholder) {
                btn.classList.add("active-stakeholder");
            }
        });
    }

    stakeholderButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const stakeholder = e.target.dataset.stakeholder;
            updateChart(stakeholder);
        });
    });

    // Initialize with City Data
    updateChart("city");
});
