
import "./assets/style/style.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import chainImg from "./assets/img/chain_ssl_key.webp"
import server from "./assets/img/server_ssl_key.webp"
import React from 'react'
import { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [typeError, setTypeError] = useState({isError:false, message:""})
  const [data, setData] = useState({});
  const [summary, setSummary] = useState({});
  const [chain, setChain] = useState([]);
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const checkSSL = () => {
    const checkingUrl = document.getElementById("checkingUrl")
    if (!checkingUrl.value || checkingUrl.value.trim().length < 3 || checkingUrl.value.trim().length > 253) {
      setTypeError({isError:true, message:"URL uzunluğu 3 ilə 253 simvol arasında olmalıdır."})
      return
    }
     else {

      setTypeError({isError:false, message:""})
      const url = checkingUrl.value.trim()
      
          setLoading(true)
      
      
      axios.get(`/api/check?domain=${encodeURIComponent(url)}`)
        .then(response => response.data)
        .then(dataApi => {
          setShowResults(false)
          setLoading(false)

          setData(dataApi)
          setSummary(dataApi.summary || {})
          setChain(dataApi.chain || {})
          setLoading(false)
          setShowResults(true)
                 
          
        })
        .catch((e) => {
            setShowResults(false)
          setLoading(false)
          setTypeError({isError:true, message:"Bu URL üçün məlumat alınarkən bir xəta baş verdi. Zəhmət olmasa, URL-nin düzgün formatda olduğundan və serverin işlək olduğundan əmin olun."})
        })
      

      }

}

  return (
    <main className="min-h-screen w-full bg-gray-900 p-4 md:p-8 lg:p-12">
  <div className="max-w-7xl mx-auto bg-gray-800 shadow-sm rounded-xl p-6 md:p-10">
    
    <h1 className="text-2xl md:text-4xl font-bold text-white">
      TLS Sertifikatı Yoxlama
    </h1>
    
    <p className="mt-4 text-gray-300">
      SSL sertifikatınızın quraşdırılması zamanı yaranan xətaları sürətlə aşkar etmək üçün bizim SSL Yoxlayıcı alətimizdən 
      istifadə edin. Bu sistem vasitəsilə serverinizdəki sertifikatın düzgün quraşdırıldığını, keçərli olduğunu və bütün 
      brauzerlər tərəfindən etibarlı hesab edildiyini anında yoxlaya bilərsiniz. Sadəcə saytınızın ünvanını aşağıdakı 
      xanaya daxil edib düyməyə klikləməklə, istifadəçilərinizin heç bir təhlükəsizlik xətası ilə qarşılaşmadığından 
      əmin olun.
    </p>
<form 
  onSubmit={(e) => {
    e.preventDefault(); // Səhifənin yenilənməsinin qarşısını alır
    checkSSL();
  }} 
  className="mt-6 flex items-center space-x-4"
>
  <div className="flex items-center bg-gray-700 rounded-md px-3 py-2 w-full md:w-auto">
    <i className="bi bi-link-45deg text-gray-400 mr-2"></i>
    <input 
      maxLength={253} 
      minLength={3} 
      type="text" 
      id="checkingUrl" 
      placeholder="URL daxil edin..." 
      className="bg-transparent focus:outline-none text-white w-full" 
    />
  </div>
  
  {/* type="submit" düyməyə Enter ilə işləmə qabiliyyəti qazandırır */}
  <button 
    type="submit" 
    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
  >
    Yoxla
  </button>
</form>
    {(typeError.isError && typeError.message ? (
<div className="bg-red-100 border  border-red-400 text-red-700 px-4 py-3 rounded w-full mt-4" role="alert">
  <span className="block sm:inline">{typeError.message}</span>

</div>
    ) : null)}
         
        <span className={`loading mt-4 loading-bars m-auto ${loading ? "" : "hidden"} loading-md`} id="loadingBars" ></span>

    <div id="results" className={`mt-8 space-y-3 ${showResults ? "" : "hidden"}`}>

  {summary && Object.keys(summary).length > 0 ? Object.values(summary).map((item, index) => (
    <div key={index}>
      <div className="flex items-center space-x-3"> <i className="bi bi-check-circle text-green-500 text-2xl"></i> <span className="text-gray-300">{item}</span></div>
    </div>
)) : null}   

    </div>
    <div className={showResults ? "" : "hidden"}>
      <div className="flex mt-4 items-center space-x-3">
        <div className="w-3/12 md:max-w-35">
          <img src={server} alt="chain" className="w-full h-auto" />
        </div>
        <div className="w-9/12">
          <ul>
            <li><b>Common name:</b> <span id="commonNameServer">{data && data.certInfo ? data.certInfo.commonName : "N/A"}</span></li>
            <li><b>SANs:</b> <span id="sansServer">{data && data.certInfo ? data.certInfo.sans || "N/A" : "N/A"}</span></li>
            <li><b>Organization:</b> <span id="organizationServer">{data && data.certInfo ? data.certInfo.organization || "N/A" : "N/A"}</span></li>
            <li><b>Location:</b> <span id="locationServer">{data && data.certInfo && data.certInfo.location !== ", , " ? data.certInfo.location || "N/A" : "N/A"}</span></li>
            <li><b>Valid :</b> <span id="validFromServer">{data && data.certInfo ? String(data.certInfo.validFrom) || "N/A" : "N/A"}</span> to <span id="validToServer">{data && data.certInfo ? data.certInfo.validTo || "N/A" : "N/A"}</span></li>
            <li><b>Signature Algorithm: :</b> <span id="signatureAlgorithmServer">{data && data.certInfo ? data.certInfo.signatureAlgorithm || "N/A" : "N/A"}</span></li>
            <li><b>Issuer:</b> <span id="issuerServer">{data && data.certInfo ? data.certInfo.issuer || "N/A" : "N/A"}</span></li>
            
          </ul>
        </div>
      </div>


        {chain && Object.keys(chain).length > 0 ? Object.values(chain).map((cert, index) => (
          <div key={index}><div className=" justify-center mb-2">
            <i className="bi bi-arrow-down text-green-500 text-5xl"></i>
          </div>
            <div className="flex mt-4 items-center space-x-3">
            
          <div className="w-3/12 md:max-w-35">
            <img src={chainImg} alt="chain" className="w-full h-auto" />
          </div>
          <div className="w-9/12">
              <div key={index} className="mb-4">
                <ul>
                  <li><b>Common name:</b> <span id={`commonNameChain${index}`}>{cert.commonName || "N/A"}</span></li>
                  <li><b>Organization:</b> <span id={`organizationChain${index}`}>{cert.organization || "N/A"}</span></li>
                  <li><b>Location:</b> <span id={`locationChain${index}`}>{cert.location !== ", , " ? cert.location || "N/A" : "N/A"}</span></li>
                  <li><b>Valid :</b> <span id={`validFromChain${index}`}>{String(cert.validFrom) || "N/A"}</span> to <span id={`validToChain${index}`}>{cert.validTo || "N/A"}</span></li>
                  <li><b>Issuer:</b> <span id={`issuerChain${index}`}>{cert.issuer || "N/A"}</span></li>
                </ul>
              </div>
          </div>
        </div>
        </div>
)) : null}   

    </div>

  </div>
  


</main>
  )
}



export default App
