async function predictAttack() {

    const protocol = document.getElementById("protocol").value;
    const service = document.getElementById("service").value;
    const flag = document.getElementById("flag").value;

    const src_bytes = document.getElementById("src_bytes").value;
    const dst_bytes = document.getElementById("dst_bytes").value;
    const duration = document.getElementById("duration").value;

    const resultBox = document.getElementById("result");


    // Check inputs
    if (
        src_bytes === "" ||
        dst_bytes === "" ||
        duration === ""
    ) {

        resultBox.className = "result-box";

        resultBox.innerHTML = `
            <h2>⚠️ Please fill all fields!</h2>
            <p>Enter network details before analysis.</p>
        `;

        return;
    }


    // Loading
    resultBox.className = "result-box";

    resultBox.innerHTML = `
        <h2>⏳ Analyzing Network Traffic...</h2>
        <p>Please wait while the AI model analyzes the data.</p>
    `;


    try {

        const response = await fetch(
            "/predict",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    protocol: protocol,
                    service: service,
                    flag: flag,

                    src_bytes: Number(src_bytes),
                    dst_bytes: Number(dst_bytes),
                    duration: Number(duration)

                })

            }
        );


        if (!response.ok) {

            throw new Error("Server error");

        }


        const data = await response.json();


        // ATTACK RESULT
        if (data.prediction === "Attack Detected") {

            resultBox.className =
                "result-box attack-result";

            resultBox.innerHTML = `

                <h2>🚨 ATTACK DETECTED</h2>

                <p>
                    ⚠️ Potential malicious network activity detected!
                </p>

                <p>
                    <strong>
                        Attack Probability:
                        ${data.attack_probability}%
                    </strong>
                </p>

                <p>
                    Threshold:
                    ${(data.threshold * 100).toFixed(2)}%
                </p>

            `;

        }


        // NORMAL RESULT
        else {

            resultBox.className =
                "result-box normal-result";

            resultBox.innerHTML = `

                <h2>✅ NORMAL TRAFFIC</h2>

                <p>
                    Network traffic appears safe.
                </p>

                <p>
                    <strong>
                        Attack Probability:
                        ${data.attack_probability}%
                    </strong>
                </p>

                <p>
                    Threshold:
                    ${(data.threshold * 100).toFixed(2)}%
                </p>

            `;

        }


        // Add result to history
        addToHistory(

            protocol,

            service,

            data.prediction,

            data.attack_probability

        );


    }


    catch (error) {

        console.error(error);

        resultBox.className =
            "result-box error-result";

        resultBox.innerHTML = `

            <h2>❌ Connection Error</h2>

            <p>
                Unable to connect to the backend server.
            </p>

            <p>
                Please make sure Flask is running.
            </p>

        `;

    }

}



// Detection History Function

function addToHistory(

    protocol,

    service,

    prediction,

    probability

) {

    const historyBody =
        document.getElementById("history-body");


    // Remove empty history message

    const emptyHistory =
        document.getElementById("empty-history");


    if (emptyHistory) {

        emptyHistory.remove();

    }


    // Get current time

    const currentTime =
        new Date().toLocaleTimeString();


    // Create new table row

    const row =
        document.createElement("tr");


    // Prediction style

    let predictionClass = "";


    if (prediction === "Attack Detected") {

        predictionClass = "history-attack";

    }

    else {

        predictionClass = "history-normal";

    }


    // Add data

    row.innerHTML = `

        <td>${currentTime}</td>

        <td>${protocol.toUpperCase()}</td>

        <td>${service.toUpperCase()}</td>

        <td class="${predictionClass}">
            ${prediction}
        </td>

        <td>
            ${probability}%
        </td>

    `;


    // Add newest result on top

    historyBody.prepend(row);

}
