import { useEffect } from 'react';

export default function BuyMeACoffee() {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
        script.dataset.name = "bmc-button";
        script.dataset.slug = "flash.nl";
        script.dataset.color = "#FFDD00";
        script.dataset.emoji = "";
        script.dataset.font = "Cookie";
        script.dataset.text = "Buy me a coffee";
        script.dataset.outlineColor = "#000000";
        script.dataset.fontColor = "#000000";
        script.dataset.coffeeColor = "#ffffff";
        script.async = true;

        // Use a container to append, or document.body if that fails, but usually these widgets are fixed position.
        // The script adds a fixed button, so document.body is appropriate.
        document.body.appendChild(script);

        return () => {
            // Cleanup usually involves removing the script, but the widget sometimes leaves DOM nodes.
            // We try to remove the script tag at least.
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
            // Note: The widget might inject other elements (like the button itself) which this basic cleanup might miss.
            // For a simple script inclusion, this is standard.
            const widget = document.getElementById('bmc-wbtn');
            if (widget) {
                widget.remove();
            }
        };
    }, []);

    return null; // The script renders its own UI (fixed button)
}
