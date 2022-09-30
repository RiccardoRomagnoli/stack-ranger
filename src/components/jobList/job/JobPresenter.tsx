import JobView from "./JobView";
import {useState} from "react";

const imgLoader = ({ src }: {src: string}) => {
    const cleanName = src.replace(/ /g, '-');
    return `https://findwork-dev-images.s3.amazonaws.com/${cleanName}`;
}

const getRandomColor = () => {
    const randColors = ["bg-green-400", "bg-red-400", "bg-blue-400", "bg-orange-400"];
    return randColors[Math.floor(Math.random() * randColors.length)];
}

const JobPresenter = ({job}: {job: {role: string, company_name: string}}) => {
    const [placeholder, setPlaceholder] = useState(false);
    return (<JobView role={job.role} company_name={job.company_name} placeholder={placeholder} imgLoader={imgLoader} getRandomColor={getRandomColor} imgError={()=>setPlaceholder(true)}></JobView>);
}
export default JobPresenter;
