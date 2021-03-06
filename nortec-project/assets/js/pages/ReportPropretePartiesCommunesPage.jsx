import React, { useEffect, useRef, useState } from "react";
import { withRouter } from "react-router-dom";
import NavbarLeft from "../components/navbars/NavbarLeft";
import Button from "../components/forms/Button";
import "../../css/app.css";
import { toast } from "react-toastify";
import ReportsAPI from "../services/ReportsAPI";
import ReportImputation from "../components/ReportImputation";
import ReportComment from "../components/ReportComment";
import ReportAddPhoto from "../components/ReportAddPhoto";
import CardConformity from "../components/CardConformity";
import ImputationTitle from "../components/wrapper/ImputationTitle";
import useIsMountedRef from "../components/UseIsMountedRef";
import handleSubmitConformity from "../components/ReportConformity";
import ProjectsAPI from "../services/ProjectsAPI";

const ReportPropretePartiesCommunesPage = ({ match }) => {
  const [conforme, setConforme] = useState(false);
  const NavbarLeftWithRouter = withRouter(NavbarLeft);
  const [imputations, setImputations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editImput, setEditImput] = useState();
  const [report, setReport] = useState({});
  const isMountedRef = useIsMountedRef();
  const imputationsRef = useRef([]);
  const urlParams = match.params;

  // -------------------------------------------------function-------------------------------------------------------

  const fetchReport = async (id) => {
    imputationsRef.current = [];
    try {
      const data = await ReportsAPI.findReport(id);
      if (isMountedRef.current) {
        setReport(data);
        setConforme(data.propreteCommuneConformity);
        // ----------------------------------------------create new imputations-------------
        if (data.propreteCommuneImputations == 0) {
          setEditImput(false);
          const lots = await ProjectsAPI.getLots(urlParams.id);
          imputationsRef.current = lots.map((imput) =>
            JSON.stringify({
              companyName: imput.company.nom,
              company: "/api/companies/" + imput.company.id,
              report: "/api/reports/" + urlParams.idReport,
              commentaire: "",
              percent: 0,
            })
          );
          imputationsRef.current = [...new Set(imputationsRef.current)];
          imputationsRef.current = imputationsRef.current.map((imputation) =>
            JSON.parse(imputation)
          );
          setImputations(imputationsRef.current);
          // ----------------------------------------------format existing imputations-------------
        } else {
          setEditImput(true);
          imputationsRef.current = data.propreteCommuneImputations.map(
            (imput) => ({
              idImput: imput.id,
              companyName: imput.company.nom,
              company: "/api/companies/" + imput.company.id,
              report: "/api/reports/" + urlParams.idReport,
              commentaire: imput.commentaire,
              percent: imput.percent,
            })
          );
          setImputations(imputationsRef.current);
        }
        setLoading(false);
      }
      // ---------------------------------------------
    } catch (error) {
      toast.error("Erreur lors du chargement du rapport");
      console.log(error);
      console.log(error.response);
    }
  };

  useEffect(() => {
    fetchReport(urlParams.idReport);
  }, [urlParams.id, urlParams.idReport]);

  // --------------------------------------------------template--------------------------------------------

  return (
    <main className="container">
      <NavbarLeftWithRouter selected="propetepartiecommune" />
      {!loading && (
        <div className="page-content">
          <ImputationTitle title={"Propret?? parties communes :"}>
            <Button
              onClick={() => setConforme(true)}
              className="btn btn-success mb-4"
              text="Conforme"
              type="button"
            />
            <Button
              onClick={() => setConforme(false)}
              className="btn btn-danger ml-5 mb-4"
              text="Non Conforme"
              type="button"
            />
          </ImputationTitle>

          {conforme && (
            <CardConformity
              titre="Propret?? des parties communes conforme ?"
              submit={()=>handleSubmitConformity(
                "propreteCommuneConformity",
                conforme,
                fetchReport,
                urlParams.idReport
              )}
            />
          )}
          {conforme === false && (
            <>
              <ReportImputation
                setLoading={setLoading}
                setImputations={setImputations}
                imputations={imputations}
                editImput={editImput}
                fetchReport={fetchReport}
                urlParams={urlParams}
                api={"propreteCommun"}
              />
              <ReportAddPhoto
                reportID={urlParams.idReport}
                typePhoto="commune"
              />
              <ReportComment
                setReport={setReport}
                report={report}
                valueComment={report.propreteCommuneComment}
                nameComment="propreteCommuneComment"
                valueCommentIntern={report.propreteCommuneCommentIntern}
                nameCommentIntern="propreteCommuneCommentIntern"
                fetchReport={fetchReport}
                idReport={urlParams.idReport}
              />
              <div className="d-flex justify-content-center">
                <Button
                  onClick={()=>handleSubmitConformity(
                    "propreteCommuneConformity",
                    conforme,
                    fetchReport,
                    urlParams.idReport
                  )}
                  className="btn btn-primary"
                  text="Confirmer"
                  type="button"
                  name="conformity"
                />
              </div>
            </>
          )}
        </div>
      )}
      {loading && <div id="loading-icon" />}
    </main>
  );
};

export default ReportPropretePartiesCommunesPage;
