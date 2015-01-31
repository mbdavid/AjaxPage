<%@ Page Title="" Language="C#" MasterPageFile="~/Content/Page.Master" AutoEventWireup="true" %>
<script runat="server">

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            rpt.DataSource = new string[10];
            rpt.DataBind();
        }
    }

    protected void btn_Click(object sender, EventArgs e)
    {
        var ctr = (TextBox)((Repeater)rpt.Items[0].FindControl("rpt2")).Items[0].Controls[1];

        SetFocus(ctr);
    }

    protected void txt1_TextChanged(object sender, EventArgs e)
    {
        TextBox txt = (TextBox)sender;
        txt.Text = DateTime.Now.Second.ToString();
    }

    protected void rpt_ItemDataBound(object sender, RepeaterItemEventArgs e)
    {
        if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
        {
            var rpt2 = (Repeater)e.Item.FindControl("rpt2");
            rpt2.DataSource = new string[10];
            rpt2.DataBind();
        }
    }

</script>
<asp:Content ID="ctrContent" ContentPlaceHolderID="content" runat="server">

    <asp:Button runat="server" ID="btn" OnClick="btn_Click" Text="FirstFocus" />

    <asp:Repeater runat="server" ID="rpt" onitemdatabound="rpt_ItemDataBound">
        <HeaderTemplate>
            <table border="0">
        </HeaderTemplate>
        <ItemTemplate>
            <tr>
                <asp:Repeater runat="server" ID="rpt2">
                    <ItemTemplate>
                        <td>
                            <asp:TextBox runat="server" ID="txt" AutoPostBack="true" OnTextChanged="txt1_TextChanged" Width="35" />
                        </td>
                    </ItemTemplate>
                </asp:Repeater>
            </tr>
        </ItemTemplate>
        <FooterTemplate>
            </table>
        </FooterTemplate>
    </asp:Repeater>

</asp:Content>
