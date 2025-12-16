import { useCallback, useContext, useEffect } from "react";
import { UNSAFE_NavigationContext as NavigationContext } from "react-router-dom";

export function usePrompt(message, when = true) {
    const { navigator } = useContext(NavigationContext);

    useEffect(() => {
        if (!when) return;

        const push = navigator.push;

        navigator.push = (...args) => {
            const confirmLeave = window.confirm(message);
            if (confirmLeave) {
                navigator.push = push;
                push(...args);
            }
        };

        return () => {
            navigator.push = push;
        };
    }, [navigator, message, when]);
}
