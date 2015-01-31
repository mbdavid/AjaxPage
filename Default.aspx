<%@ Page Language="C#" AutoEventWireup="true" EnableViewState="false" %>
<script runat="server">

    protected void Page_Load(object sender, EventArgs e)
    {
        rpt.DataSource = System.IO.Directory.GetFiles(Server.MapPath("~/Demo"), "*.aspx")
            .Select(x => System.IO.Path.GetFileName(x)).ToArray();
        
        rpt.DataBind();
    }

</script>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
    <div>
        <h1>Index</h1>
        <hr />
        <asp:Repeater runat="server" ID="rpt">
            <HeaderTemplate>
                <ul>
            </HeaderTemplate>
            <ItemTemplate>
                <li><a href=<%# "Demo/" + Container.DataItem %>><%# Container.DataItem %></a></li>
            </ItemTemplate>
            <FooterTemplate>
                </ul>
            </FooterTemplate>
        </asp:Repeater>
    </div>
    </form>
</body>
</html>
