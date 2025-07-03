import React from 'react';

// Define SVGs for icons that are re-used or aliased
const SvgInformationCircle = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);

const SvgExclamationTriangle = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);

const SvgLightBulb = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.355a7.5 7.5 0 0 1-3 0m3 0a7.5 7.5 0 0 0-3 0m.375 0a.75.75 0 0 0-.75 0m3.375 2.25c-.981.564-2.03.812-3.125.812s-2.144-.248-3.125-.812M12 6.75A4.506 4.506 0 0 0 7.5 11.25c0 1.518.835 2.825 2.073 3.522m4.854-3.522c1.238-.697 2.073-2.004 2.073-3.522A4.506 4.506 0 0 0 12 6.75Z" />
  </svg>
);

const SvgCheckCircle = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const SvgPencilSquare = (
   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);


// Heroicons (Outline) - Add more as needed
const icons = {
  academicCap: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  ),
  arrowPath: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  bolt: (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  ),
  documentText: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  sparkles: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  ),
   arrowLeft: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  ),
  arrowRight: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  ),
  photo: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.158 0a.225.225 0 0 1 .225-.225h.008a.225.225 0 0 1 .225.225v.008a.225.225 0 0 1-.225.225h-.008a.225.225 0 0 1-.225-.225V8.25Z" />
    </svg>
  ),
  lightbulb: SvgLightBulb,
  checkCircle: SvgCheckCircle,
  xCircle: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  chartBar: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  users: ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m8.118 0a12.025 12.025 0 0 1-8.118 0m0 0A12.015 12.015 0 0 1 3 12.75a12.015 12.015 0 0 1 2.982-7.27m9.036 0A12.015 12.015 0 0 1 21 12.75a12.015 12.015 0 0 1-2.982 7.27M12 12.75a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
    </svg>
  ),
  userGroup: ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-.114.01-.227.029-.339m-3.029 3.206a9.337 9.337 0 0 1-4.121-.952 4.125 4.125 0 0 1-7.533-2.493M15 19.128V9.75M18.75 12H12M12 9.75H5.25M15 19.128V9.75m0 9.378c0 .621-.504 1.125-1.125 1.125H9.75v-1.125c0-.621.504-1.125 1.125-1.125H15Z M12 14.25v5.625c0 .621-.504 1.125-1.125 1.125H9.75V14.25m0-4.5H5.25v5.625c0 .621.504 1.125 1.125 1.125H9.75m0-4.5H5.25M5.25 14.25h4.5M12 14.25v-5.25c0-.621-.504-1.125-1.125-1.125H9.75V7.875c0-.621.504-1.125 1.125-1.125H12m0 4.875c.621 0 1.125.504 1.125 1.125v5.625c0 .621-.504 1.125-1.125 1.125H9.75v-5.625c0-.621.504-1.125 1.125-1.125H12ZM15 9.75v5.625c0 .621.504 1.125 1.125 1.125h.375c.621 0 1.125-.504 1.125-1.125V9.75c0-.621-.504-1.125-1.125-1.125h-.375A1.125 1.125 0 0 0 15 9.75Z" />
    </svg>
  ),
  cog: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.008 1.11-.968l2.306.262c.577.065 1.056.49 1.181 1.05l.362 1.624a1.986 1.986 0 0 0 2.37.989l1.892-.716c.55-.207 1.188.068 1.393.606l1.085 2.25c.206.428-.01.95-.51 1.168l-1.606.73a1.986 1.986 0 0 0-.244 3.106l1.018 1.85c.382.695.023 1.574-.668 1.89l-2.122.955c-.538.242-1.147.01-1.37-.502l-.582-1.304a1.986 1.986 0 0 0-2.923-.59l-1.637.953c-.53.307-1.196.055-1.442-.488l-1.226-2.121c-.246-.433.003-.98.487-1.22l1.637-.953a1.986 1.986 0 0 0 .59-2.922l-1.305-.582c-.513-.229-.745-.838-.502-1.37l.955-2.122c.262-.577.876-.948 1.48-.795l1.85.678a1.986 1.986 0 0 0 3.106-.244l.73-1.606c.218-.508-.06-.998-.606-1.123l-2.25-1.086c-.428-.206-.95.01-1.168.51l-.716 1.892a1.986 1.986 0 0 0 .989 2.37L7.9 11.23a1.986 1.986 0 0 0 2.37.989l1.892-.716c.55-.207 1.188.068 1.393.606l1.085 2.25c.206.428-.01.95-.51 1.168l-1.606.73a1.986 1.986 0 0 0-.244 3.106l1.018 1.85c.382.695.023 1.574-.668 1.89l-2.122.955c-.538.242-1.147.01-1.37-.502l-.582-1.304a1.986 1.986 0 0 0-2.923-.59l-1.637.953c-.53.307-1.196.055-1.442-.488l-1.226-2.121c-.246-.433.003-.98.487-1.22l1.637-.953a1.986 1.986 0 0 0 .59-2.922l-1.305-.582c-.513-.229-.745-.838-.502-1.37l.955-2.122c.262-.577.876-.948 1.48-.795l1.85.678a1.986 1.986 0 0 0 3.106-.244l.73-1.606c.218-.508-.06-.998-.606-1.123l-2.25-1.086c-.428-.206-.95.01-1.168.51l-.716 1.892a1.986 1.986 0 0 0 .989 2.37L7.9 11.23Z" />
    </svg>
  ),
  informationCircle: SvgInformationCircle,
  target: ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
    </svg>
  ),
   exclamationTriangle: SvgExclamationTriangle,
  briefcase: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.155V18a2.25 2.25 0 0 1-2.25 2.25h-12A2.25 2.25 0 0 1 3.75 18V9.75A2.25 2.25 0 0 1 6 7.5h12A2.25 2.25 0 0 1 20.25 9.75v4.405M16.5 7.5V6a2.25 2.25 0 0 0-2.25-2.25h-3A2.25 2.25 0 0 0 9 6v1.5M12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
    </svg>
  ),
  chatBubbleLeftRight: (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.696-3.696c-.34-.34-.782-.544-1.258-.544H6.382c-1.136 0-2.097-.847-2.193-1.98A11.954 11.954 0 0 1 4 12.879V8.59c0-1.136.847-2.1 1.98-2.193.34-.027.68-.052 1.02-.072V3.75L9.696 7.446c.34.34.782.544 1.258.544h3.994c1.136 0 2.097.847 2.193 1.98.027.341.052.68.072 1.02Z" />
    </svg>
  ),
  calendarDays: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-3.75h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
    </svg>
  ),
  wrenchScrewdriver: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.83-5.83M11.42 15.17A2.652 2.652 0 0 1 14.25 12.5l2.495-2.495a1.5 1.5 0 0 0-2.122-2.122L12.5 10.378A2.652 2.652 0 0 1 9.83 7.707l-2.495 2.495a1.5 1.5 0 0 0 2.122 2.122L12 9.622M11.42 15.17l-.375.375a1.5 1.5 0 0 0 2.122 2.122l.375-.375M11.42 15.17l2.495-2.495M3 8.25V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v10.5M3 8.25a2.25 2.25 0 0 0-2.25 2.25v6a2.25 2.25 0 0 0 2.25 2.25h2.25M3 8.25h3.75M3 12h3.75m0 0a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6.75m0 0H3.75m0 0H3.75m0 0H3.75m9-9.75h3.75M12.75 12h3.75m0 0a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25M12.75 12V8.25" />
    </svg>
  ),
  buildingOffice2: ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M8.25 21V3m8.25 18V3M3 15h18M3 12h18M3 9h18M3 6h18" />
    </svg>
  ),
  chartPie: ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
  ),
  arrowTrendingUp: ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  ),
  currencyDollar: ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  banknotes: ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.75C2.25 5.004 2.754 4.5 3.375 4.5H18a2.25 2.25 0 0 1 2.25 2.25v11.25a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 18.75V18.75m0-12.75h.008v.008H4.5v-.008Zm0 3h.008v.008H4.5v-.008Zm0 3h.008v.008H4.5v-.008Zm0 3h.008v.008H4.5v-.008Zm0 3h.008v.008H4.5v-.008Zm3-12h.008v.008H7.5v-.008Zm0 3h.008v.008H7.5v-.008Zm0 3h.008v.008H7.5v-.008Zm0 3h.008v.008H7.5v-.008Zm0 3h.008v.008H7.5v-.008Zm3-12h.008v.008H10.5v-.008Zm0 3h.008v.008H10.5v-.008Zm0 3h.008v.008H10.5v-.008Zm0 3h.008v.008H10.5v-.008Zm0 3h.008v.008H10.5v-.008Zm3-12h.008v.008H13.5v-.008Zm0 3h.008v.008H13.5v-.008Zm0 3h.008v.008H13.5v-.008Zm0 3h.008v.008H13.5v-.008Zm0 3h.008v.008H13.5v-.008Z" />
    </svg>
  ),
  questionMarkCircle: (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
     </svg>
  ),
  magnifyingGlass: (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
     </svg>
  ),
  envelope: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  lifebuoy: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.378 2.053A10.5 10.5 0 0 1 21.947 12.622m-19.894 0A10.51 10.51 0 0 1 12.622 2.053m0 19.894A10.51 10.51 0 0 1 2.053 11.378m19.894 0A10.5 10.5 0 0 1 11.378 21.947M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m18.364 5.636-12.728 12.728m12.728 0L5.636 5.636" />
    </svg>
  ),
  gift: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.033A6.375 6.375 0 0 0 6 6.75v10.5A2.25 2.25 0 0 0 8.25 19.5h7.5A2.25 2.25 0 0 0 18 17.25V6.75a6.375 6.375 0 0 0-5.25-3.717Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.423A3.375 3.375 0 0 1 12 2.25c1.238 0 2.37.674 2.953 1.705M9 3.423V1.5A1.5 1.5 0 0 1 10.5 0h3A1.5 1.5 0 0 1 15 1.5v1.923M15 3.423A3.375 3.375 0 0 1 12 2.25c-.007 0-.014 0-.02-.001M15 3.423h.01M9 3.423H8.99M3 9.75h18v-.01a12.288 12.288 0 0 0-2.022-6.238 12.518 12.518 0 0 0-13.956 0A12.288 12.288 0 0 0 3 9.74V9.75Z" />
    </svg>
  ),
  archiveBox: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125V8.25a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75V4.875Zm0 0c0 .621.504 1.125 1.125 1.125h14.25c.621 0 1.125-.504 1.125-1.125m-16.5 0V2.25A2.25 2.25 0 0 1 5.625 0h12.75A2.25 2.25 0 0 1 20.25 2.25v2.625m-16.5 0v11.25A2.25 2.25 0 0 0 5.625 21h12.75A2.25 2.25 0 0 0 20.25 18.75V4.875m-16.5 0h16.5M12 14.25v-3.75m0 0a1.125 1.125 0 0 1 1.125-1.125h.008a1.125 1.125 0 0 1 1.125 1.125v.008a1.125 1.125 0 0 1-1.125 1.125H12Zm0 0L9.75 12M12 14.25L9.75 12m2.25 2.25 2.25-2.25" />
    </svg>
  ),
  shieldCheck: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
  ),
  cloudArrowUp: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 5.75 5.75 0 0 1 4.908 4.097M6.75 19.5h10.5" />
    </svg>
  ),
  star: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.822.672l-4.79-2.997a.563.563 0 0 0-.652 0l-4.79 2.997a.562.562 0 0 1-.822-.672l1.285-5.385a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  ),
  heart: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  ),
  clock: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  mapPin: (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
       <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
     </svg>
  ),
  rectangle: ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 3H3v18h18V3zM5 5v14M19 5v14M5 5h14M5 19h14" />
    </svg>
  ),
  // Icons for Floating Toolbar & Block Palette
  textBold: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4.5h7.5a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H6m0-6v6m0-6V3m0 7.5v6.75A2.25 2.25 0 0 0 8.25 21h5.25a2.25 2.25 0 0 0 2.25-2.25V15m-7.5-7.5h7.5" />
    </svg>
  ),
  textItalic: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3h7.5M10.5 3v18M15.75 21h-7.5" />
    </svg>
  ),
  textUnderline: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4.5v9a3.75 3.75 0 0 0 3.75 3.75h4.5A3.75 3.75 0 0 0 18 13.5v-9M4.5 21h15" />
    </svg>
  ),
  alignLeft: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h11.25m-11.25 5.25h16.5" />
    </svg>
  ),
  alignCenter: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M7.5 12h9m-9 5.25h9M3.75 12h.008v.008H3.75V12Zm0 5.25h.008v.008H3.75v-.008Zm16.5 0h.008v.008h-.008v-.008Zm0-5.25h.008v.008h-.008V12Zm-4.5 5.25h.008v.008h-.008v-.008Zm0-5.25h.008v.008h-.008V12Z" />
    </svg>
  ),
  alignRight: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M9 12h11.25M3.75 17.25h16.5" />
    </svg>
  ),
  textColor: ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 6.586l3.293-3.293a1 1 0 011.414 0l.086.086A11.96 11.96 0 0115 15.071l-.07.07a1 1 0 01-1.414 0L10.293 11.914a1 1 0 010-1.414l-3.293-3.293zm0 0V4.5m0 2.086L4.5 3.5m3 3.086L3 7.5M10.293 11.914a1 1 0 010-1.414l-3.293-3.293M15 15.071a11.962 11.962 0 01-2.929 2.929l.07.07a1 1 0 010 1.414l-3.293 3.293a1 1 0 01-1.414 0l-.086-.086A11.96 11.96 0 019 8.929l.07-.07a1 1 0 011.414 0l3.293 3.293a1 1 0 010 1.414L15 15.071z" />
    </svg>
  ),
  bgColor: ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.442-2.123-2.123M15 11.25h.008v.008H15v-.008Zm0 2.25h.008v.008H15v-.008Zm0 2.25h.008v.008H15v-.008Zm-2.25-4.5h.008v.008H12.75v-.008Zm0 2.25h.008v.008H12.75v-.008Zm0 2.25h.008v.008H12.75v-.008Zm-2.25-4.5h.008v.008H10.5v-.008Zm0 2.25h.008v.008H10.5v-.008Zm0 2.25h.008v.008H10.5v-.008Z" />
    </svg>
  ),
  listBullet: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  ),
  listNumber: ( // Updated for better visibility
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <text x="3" y="8" fontFamily="sans-serif" fontSize="6" strokeWidth="0.5">1.</text>
      <text x="3" y="14" fontFamily="sans-serif" fontSize="6" strokeWidth="0.5">2.</text>
      <text x="3" y="20" fontFamily="sans-serif" fontSize="6" strokeWidth="0.5">3.</text>
      <line x1="9" y1="7" x2="20" y2="7" />
      <line x1="9" y1="13" x2="20" y2="13" />
      <line x1="9" y1="19" x2="20" y2="19" />
    </svg>
  ),
  link: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  ),
  arrowUpCircle: ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  arrowDownCircle: ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  documentDuplicate: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m9.75 12.375c0 .621-.504 1.125-1.125 1.125H18.75m-4.5-5.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V14.25Zm0 2.25h.008v.008h-.008V16.5Zm-2.25-5.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V14.25Zm0 2.25h.008v.008h-.008V16.5Z" />
    </svg>
  ),
  trash: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  pencilSquare: SvgPencilSquare,
  // New icons for Block Types
  table: ( // table-cells from heroicons
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5V7.5M15 4.5V19.5m-3.375-15A1.125 1.125 0 0 1 12.75 3h1.5a1.125 1.125 0 0 1 1.125 1.125m-3.375 0V7.5m9-3A1.125 1.125 0 0 0 19.125 3h-1.5a1.125 1.125 0 0 0-1.125 1.125M15 4.5V7.5m-10.5 12V4.875c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125V19.5m-12 0h10.5" />
    </svg>
  ),
  video: ( // video-camera from heroicons
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
    </svg>
  ),
  line: ( // minus from heroicons (for divider line)
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  ),
  button: ( // cursor-arrow-rays from heroicons (for button block)
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m0 13.5v2.25M17.25 7.5h2.25M4.5 12H2.25M15.75 19.5l-2.25-2.25M4.5 4.5l2.25 2.25M7.5 17.25h2.25M12 7.5V12m2.25-.75h2.25M7.5 12H2.25M19.5 15.75l-2.25-2.25" />
    </svg>
  ),
  code: ( // code-bracket from heroicons
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  ),
  quote: ( // chat-bubble-left-ellipsis from heroicons (proxy for quote)
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-3.862 8.25-8.625 8.25a9.75 9.75 0 0 1-4.375-.999L3 21l1.203-3.72A9.753 9.753 0 0 1 3 12c0-4.556 3.862-8.25 8.625-8.25S21 7.444 21 12Z" />
    </svg>
  ),
  listTodo: ( // list-bullet with a checkmark prefix
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h.008v.008H3.75V12Zm0 3.75h.008v.008H3.75v-.008Zm0 3.75h.008v.008H3.75V19.5Zm1.5-6.375V12m0 3.75V12m0 7.5V12M9 12h9m-9 3.75h9m-9 3.75h9M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V3.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v3c0 .621.504 1.125 1.125 1.125Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 4.5 1.5 1.5L9 3" />
    </svg>
  ),
  calloutInfo: SvgInformationCircle,
  calloutWarning: SvgExclamationTriangle,
  calloutTip: SvgLightBulb,
  calloutSuccess: SvgCheckCircle,
  heading: ( // Using a simple "H" text for generic heading icon
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" strokeWidth="1">
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fontWeight="bold">H</text>
    </svg>
  ),
   plusCircle: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  minusCircle: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  queueList: ( // For general list icon
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
    </svg>
  ),
  arrowUturnLeft: ( // New icon for Back to Editor
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
    </svg>
  ),
  arrowDownTray: ( // New icon for Download JSON
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  ),
};


export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className }) => {
  const SvgIcon = icons[name];
  if (!SvgIcon) {
    console.warn(`Icon "${name}" not found.`);
    return <div className={`w-6 h-6 ${className || ''} bg-red-500 flex items-center justify-center text-white font-bold text-xs`}>?</div>; 
  }
  return React.cloneElement(SvgIcon, { className: `w-6 h-6 ${className || ''}` });
};

export default Icon;
