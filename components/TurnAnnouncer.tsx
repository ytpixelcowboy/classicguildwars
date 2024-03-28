import { useState,useEffect } from "react"

export default function TurnAnnouncer({params} : {params : {header : string, setVisible : boolean}}){

    const [isVisible, setIsVisible] = useState<boolean>(params.setVisible);

    useEffect(() => {
        // Hide the announcement after 3 seconds
        const timeout = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
    
        clearTimeout(timeout);
      }, []);

    return (
        <div className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 transition-all ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 z-20'}`}>
            <div className="bg-blue-500 text-white p-4 rounded-md shadow-md">
                <p>{params.header}</p>
            </div>
        </div>
    );
}