function FormBtn({name,onClick}:{name:String,onClick?:any}){
    return (
        <button
        type="submit"
        className="hover:bg-blue-500 text-white py-3 px-14 rounded-md bg-blue-700 transition-colors duration-500 w-full md:w-auto"
        onClick={onClick}
        >
        {name}
        </button>
    );
}
export default FormBtn;